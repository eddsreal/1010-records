import { TransactionFormTypeEnum } from '@/common/enums/transactions.enum'
import { ForecastDetail, Transaction } from '@/database/schema'
import { create } from 'zustand'
import { PriorityWithCategories } from './priorities.store'

type TransactionsStoreType = {
	mode: TransactionFormTypeEnum
	month: string
	year: string
	newTransaction: {
		selectedPriority: PriorityWithCategories | null
		executedForecast: ForecastDetail | undefined
		reset: () => void
	}
	pendingTransactions: Transaction[]
	editTransaction: Transaction | undefined
	latestTransactions: Transaction[]
	refreshTransactions: boolean
}

export const useTransactionsStore = create<TransactionsStoreType>()((set, get) => ({
	mode: TransactionFormTypeEnum.FAST,
	month: new Date().toLocaleString('es-ES', {
		month: '2-digit',
	}),
	year: new Date().getFullYear().toString(),
	pendingTransactions: [],
	editTransaction: undefined,
	newTransaction: {
		selectedPriority: null,
		executedForecast: undefined,
		reset: () => {
			set({
				mode: TransactionFormTypeEnum.FAST,
				newTransaction: {
					...get().newTransaction,
					selectedPriority: null,
				},
			})
		},
	},
	latestTransactions: [],
	refreshTransactions: false,
}))
