import { ForecastType } from '@/common/enums/forecast.enum'
import * as schema from '@/common/hooks/database/schema'
import { ForecastDetail, Transaction } from '@/common/hooks/database/schema'
import { useForecastsStore } from '@/stores/forecasts.store'
import { usePaymentMethodsStore } from '@/stores/payment-methods.store'
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

	const updatePaymentMethodBalance = async (transaction: Transaction) => {
		const paymentMethod = await db
			.select()
			.from(schema.paymentMethods)
			.where(eq(schema.paymentMethods.id, transaction?.paymentMethodId ?? 0))
		const category = await db
			.select()
			.from(schema.categories)
			.where(eq(schema.categories.id, transaction?.categoryId ?? 0))

		if (paymentMethod) {
			let newBalance = 0
			if (transaction.type === 'EXPENSE') {
				newBalance = paymentMethod[0].balance - Number(transaction.amount)
			} else {
				newBalance = paymentMethod[0].balance + Number(transaction.amount)
			}
			await db
				.update(schema.paymentMethods)
				.set({
					balance: newBalance,
				})
				.where(eq(schema.paymentMethods.id, transaction?.paymentMethodId ?? 0))
		}

		if (category?.[0]?.paymentMethodId) {
			const categoryPaymentMethod = await db
				.select()
				.from(schema.paymentMethods)
				.where(eq(schema.paymentMethods.id, category?.[0]?.paymentMethodId ?? 0))

			const balance = categoryPaymentMethod?.[0]?.balance ?? 0

			if (categoryPaymentMethod?.[0]?.type === 'CARD') {
				const newBalance = balance + Number(transaction.amount)
				await db
					.update(schema.paymentMethods)
					.set({
						balance: newBalance,
					})
					.where(eq(schema.paymentMethods.id, category?.[0]?.paymentMethodId ?? 0))
			}
		}
	}
	const createTransaction = async (transaction: Transaction) => {
		const isFullyComplete =
			!!(transaction.amount && transaction.categoryId && transaction.priorityId && transaction.paymentMethodId) ||
			(transaction.amount && transaction.paymentMethodId)

		if (isFullyComplete && yearForecast) {
			const innerMonth = moment(transaction.createdAt).month() + 1
			const innerYear = moment(transaction.createdAt).year()

			const forecastDetail = await getForecastDetail({
				priorityId: transaction?.priorityId ?? undefined,
				categoryId: transaction?.categoryId ?? undefined,
				paymentMethodId: transaction?.paymentMethodId ?? undefined,
				month: innerMonth,
				year: innerYear,
				forecastType: ForecastType.EXECUTED,
			})

			await updatePaymentMethodBalance(transaction)

			await saveForecastDetailExecuted({
				priorityId: transaction?.priorityId ?? undefined,
				categoryId: transaction?.categoryId ?? undefined,
				paymentMethodId: transaction?.paymentMethodId ?? undefined,
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
					paymentMethodId: transaction.paymentMethodId,
					description: transaction.description,
					type: transaction.type,
					status: transaction.status,
					updatedAt: new Date(),
				},
			})

		useTransactionsStore.setState({ refreshTransactions: true })
		usePaymentMethodsStore.setState({ refreshPaymentMethods: true })
		useForecastsStore.setState({ refreshForecasts: true })
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
