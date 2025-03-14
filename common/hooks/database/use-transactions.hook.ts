import { ForecastType } from '@/common/enums/forecast.enum'
import * as schema from '@/common/hooks/database/schema'
import { ForecastDetail, Transaction } from '@/common/hooks/database/schema'
import { useForecastsStore } from '@/stores/forecasts.store'
import { useTransactionsStore } from '@/stores/transactions.store'
import { desc, eq, not } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
import moment from 'moment'
import { useEffect } from 'react'
import { useForecasts } from './use-forecasts.hook'
const expoDb = openDatabaseSync('1010records')
const db = drizzle(expoDb)

interface TransactionsFilter {
	pending?: boolean
	latest?: boolean
	latestLimit?: number
}

export function useTransactions() {
	const { refreshTransactions, pendingTransactions, editTransaction } = useTransactionsStore()
	const { saveForecastDetailExecuted, getForecastDetail } = useForecasts()
	const { yearForecast } = useForecastsStore()

	useEffect(() => {
		getTransactions({ pending: true, latest: true })
	}, [refreshTransactions])

	const getTransactions = async (filter?: TransactionsFilter) => {
		if (filter?.pending) {
			const transactions = await db
				.select()
				.from(schema.transactions)
				.where(filter?.pending ? eq(schema.transactions.status, 'PENDING') : undefined)
				.orderBy(desc(schema.transactions.createdAt))

			useTransactionsStore.setState({ pendingTransactions: transactions, refreshTransactions: false })
		}

		if (filter?.latest) {
			const transactions = await db
				.select()
				.from(schema.transactions)
				.where(filter?.pending ? not(eq(schema.transactions.status, 'PENDING')) : undefined)
				.limit(filter?.latestLimit ?? 5)
				.orderBy(desc(schema.transactions.createdAt))

			useTransactionsStore.setState({ latestTransactions: transactions, refreshTransactions: false })
		}
	}

	const createTransaction = async (transaction: Transaction) => {
		const isFullyComplete =
			!!(transaction.amount && transaction.categoryId && transaction.priorityId && transaction.accountId) ||
			(transaction.amount && transaction.accountId)

		if (isFullyComplete && yearForecast) {
			const innerMonth = moment(transaction.createdAt).month() + 1
			const innerYear = moment(transaction.createdAt).year()

			const forecastDetail = await getForecastDetail({
				priorityId: transaction?.priorityId ?? undefined,
				categoryId: transaction?.categoryId ?? undefined,
				accountId: transaction?.accountId ?? undefined,
				month: innerMonth,
				year: innerYear,
				forecastType: ForecastType.EXECUTED,
			})
			await saveForecastDetailExecuted({
				priorityId: transaction?.priorityId ?? undefined,
				categoryId: transaction?.categoryId ?? undefined,
				accountId: transaction?.accountId ?? undefined,
				month: innerMonth,
				year: innerYear,
				amount: (forecastDetail?.[0]?.amount ?? 0) + Number(transaction.amount),
				forecastType: ForecastType.EXECUTED,
				transactionType: transaction.type,
				forecastId: yearForecast.id,
				id: forecastDetail?.[0]?.id,
			} as ForecastDetail).catch((error) => {
				console.log(error)
			})
			transaction.status = 'COMPLETED'
		}

		if (editTransaction) {
			transaction.id = editTransaction.id
		}

		await db
			.insert(schema.transactions)
			.values(transaction)
			.onConflictDoUpdate({
				target: [schema.transactions.id],
				set: {
					amount: transaction.amount,
					categoryId: transaction.categoryId,
					priorityId: transaction.priorityId,
					accountId: transaction.accountId,
					description: transaction.description,
					type: transaction.type,
					status: transaction.status,
					updatedAt: new Date(),
				},
			})

		useTransactionsStore.setState({ refreshTransactions: true })
	}

	const updateTransaction = async (transaction: Transaction) => {
		await db.update(schema.transactions).set(transaction).where(eq(schema.transactions.id, transaction.id))
		useTransactionsStore.setState({ refreshTransactions: true })
	}

	const deleteTransaction = async (transaction: Transaction) => {
		await db.delete(schema.transactions).where(eq(schema.transactions.id, transaction.id))
		useTransactionsStore.setState({ refreshTransactions: true })
	}

	return {
		pendingTransactions,
		createTransaction,
		updateTransaction,
		deleteTransaction,
		getTransactions,
	}
}
