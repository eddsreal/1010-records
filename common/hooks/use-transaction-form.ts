import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
import { useForm } from 'react-hook-form'

const expoDb = openDatabaseSync('1010records')
const db = drizzle(expoDb)

export interface TransactionFormValues {
	amount: number
	currency: string
	type: TransactionTypeEnum
	account: number
	priority: number
	category: number
}

export function useTransactionForm() {
	const {
		control,
		formState: { errors },
		setValue,
		watch,
		reset,
		handleSubmit,
	} = useForm<TransactionFormValues>({
		mode: 'all',
		defaultValues: {
			type: TransactionTypeEnum.EXPENSE,
			account: undefined,
			priority: undefined,
			category: undefined,
		},
	})

	const type = watch('type')
	const amount = watch('amount')
	const category = watch('category')
	const isIncome = type === TransactionTypeEnum.INCOME

	return {
		control,
		errors,
		setValue,
		watch,
		reset,
		handleSubmit,
		isIncome,
		type,
		category,
		amount,
	}
}
