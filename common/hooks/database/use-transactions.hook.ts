import * as schema from '@/database/schema'
import { Transaction } from '@/database/schema'
import { useTransactionsStore } from '@/stores/transactions.store'
import { desc, eq, not } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
import { useEffect } from 'react'

const expoDb = openDatabaseSync('1010records')
const db = drizzle(expoDb)

interface TransactionsFilter {
	pending?: boolean
	latest?: boolean
	latestLimit?: number
}

export function useTransactions() {
	const { refreshTransactions, pendingTransactions, editTransaction } = useTransactionsStore()

	useEffect(() => {
		getTransactions({ pending: true, latest: true })
	}, [refreshTransactions])

	const getTransactions = async (filter?: TransactionsFilter) => {
		if (filter?.pending) {
			const transactions = await db
				.select()
				.from(schema.transactions)
				.where(filter?.pending ? eq(schema.transactions.status, 'PENDING') : undefined)

			useTransactionsStore.setState({ pendingTransactions: transactions, refreshTransactions: false })
		}

		if (filter?.latest) {
			const transactions = await db
				.select()
				.from(schema.transactions)
				.orderBy(desc(schema.transactions.createdAt))
				.where(filter?.pending ? not(eq(schema.transactions.status, 'PENDING')) : undefined)
				.limit(filter?.latestLimit ?? 5)

			useTransactionsStore.setState({ latestTransactions: transactions, refreshTransactions: false })
		}
	}

	const createTransaction = async (transaction: Transaction) => {
		const isFullyComplete =
			!!(transaction.amount && transaction.categoryId && transaction.priorityId && transaction.accountId) ||
			(transaction.amount && transaction.accountId)

		if (isFullyComplete) {
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
	}
}
