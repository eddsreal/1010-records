import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import { Transaction } from '@/common/hooks/database/schema'
import { useAccounts } from '@/common/hooks/database/use-accounts.hook'
import { usePriorities } from '@/common/hooks/database/use-priorities.hook'
import { useTransactions } from '@/common/hooks/database/use-transactions.hook'
import { RelativeDateEnum, useDates } from '@/common/hooks/utilities/use-dates.hook'
import { useAccountsStore } from '@/stores/accounts.store'
import { usePrioritiesStore } from '@/stores/priorities.store'
import { useTransactionsStore } from '@/stores/transactions.store'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { AutoSuggestInput, AutoSuggestItem } from '../atoms/auto-suggest-input.atom'
import { CurrencyInput } from '../atoms/currency-input.atom'
import { PickerAtom } from '../atoms/picker-atom'
interface PeriodOption {
	label: string
	value: RelativeDateEnum
}

const periodOptions: PeriodOption[] = [
	{ label: 'Hoy', value: RelativeDateEnum.TODAY },
	{ label: 'Ayer', value: RelativeDateEnum.YESTERDAY },
]

interface NewTransactionForm {
	amount: number
	description: string
	category: AutoSuggestItem | null
	account: AutoSuggestItem | null
	transactionType: TransactionTypeEnum
}

export const NewTransaction: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption | null>(periodOptions[0])
	const [date, setDate] = useState<Date>(new Date())
	const { editTransaction } = useTransactionsStore()
	const { priorities } = usePrioritiesStore()
	const { accounts } = useAccountsStore()
	const [isCompleteMode, setIsCompleteMode] = useState<boolean>(false)
	const { getCagetoriesByQueryAndType } = usePriorities()
	const { getAccountByQuery } = useAccounts()
	const { createTransaction } = useTransactions()
	const { getRelativeDates } = useDates()

	const { control, handleSubmit, watch, setValue, reset } = useForm<NewTransactionForm>({
		defaultValues: {
			description: '',
			category: null,
			account: null,
			transactionType: TransactionTypeEnum.EXPENSE,
		},
	})

	const transactionType = watch('transactionType')

	const handleSearchCategories = async (search: string) => {
		const categories = await getCagetoriesByQueryAndType(search, transactionType)
		return categories.map((category) => ({
			...category,
			icon: category.icon || '',
			color: category.color || undefined,
			priorityId: category.priorityId ?? undefined,
		}))
	}

	const handleSearchAccounts = async (search: string) => {
		const accounts = await getAccountByQuery(search)
		return accounts.map((account) => ({
			...account,
			icon: '',
			color: undefined,
		}))
	}

	const handleSaveTransaction = async (data: NewTransactionForm) => {
		const transaction: Partial<Transaction> = {
			amount: data.amount,
			description: data.description,
			categoryId: data.category?.id ? Number(data.category.id) : null,
			priorityId: data.category?.priorityId ? Number(data.category.priorityId) : null,
			accountId: data.account?.id ? Number(data.account.id) : null,
			type: data.transactionType,
			createdAt: new Date(date),
			updatedAt: new Date(),
			id: editTransaction?.id,
		}

		await createTransaction(transaction as Transaction)

		reset()
		onClose()
	}

	useEffect(() => {
		const period = periodOptions.find((innerPeriod) => innerPeriod.value === selectedPeriod?.value)
		const relativeDate = getRelativeDates(new Date().toISOString(), period?.value as RelativeDateEnum)
		setDate(relativeDate.startDate.toDate())
	}, [selectedPeriod])

	useEffect(() => {
		if (editTransaction) {
			const categoryObject = priorities
				.find((priority) => priority.id === editTransaction.priorityId)
				?.categories.find((category) => category.id === editTransaction.categoryId)

			const formattedCategory = categoryObject ? {
				id: categoryObject.id.toString(),
				name: categoryObject.name,
				icon: categoryObject.icon || '',
				color: categoryObject.color || undefined,
				priorityId: categoryObject.priorityId ?? undefined
			} : null;

			const accountObject = accounts.find((account) => account.id === editTransaction.accountId);
			const formattedAccount = accountObject ? {
				id: accountObject.id.toString(),
				name: accountObject.name,
				icon: '',
				color: undefined
			} : null;

			reset({
				amount: editTransaction.amount,
				description: editTransaction.description ?? '',
				category: formattedCategory,
				account: formattedAccount,
				transactionType: editTransaction.type as TransactionTypeEnum,
			})
			setIsCompleteMode(true)
		}
	}, [editTransaction, priorities, accounts])

	const renderHeader = () => {
		return (
			<View className="flex-row items-center justify-between gap-2 w-full mb-8">
				<Text
					className={`${transactionType === TransactionTypeEnum.INCOME ? 'text-primary-500' : 'text-secondary-500'} text-4xl font-robotoBold mb-4`}
				>
					Registro
				</Text>
				<TouchableOpacity onPress={onClose}>
					<MaterialIcons name="close" size={36} color="white" />
				</TouchableOpacity>
			</View>
		)
	}
	const renderHeaderActions = () => {
		return (
			<View className="flex-row w-full gap-2 justify-between mb-4">
				<PickerAtom
					label="Periodo"
					options={periodOptions}
					value={selectedPeriod ? selectedPeriod.value : ''}
					onChange={(value) => setSelectedPeriod(periodOptions.find((option) => option.value === value) || null)}
				/>
				<View className="flex-row items-center">
					<TouchableOpacity
						className={`${transactionType === TransactionTypeEnum.INCOME ? 'bg-primary-500' : 'bg-deepBlue-600'} px-4 py-2 rounded-l-lg`}
						onPress={() => setValue('transactionType', TransactionTypeEnum.INCOME)}
					>
						<MaterialIcons name="add" size={18} color="white" />
					</TouchableOpacity>
					<TouchableOpacity
						className={`${transactionType === TransactionTypeEnum.EXPENSE ? 'bg-secondary-500' : 'bg-deepBlue-600'} px-4 py-2 rounded-r-lg`}
						onPress={() => setValue('transactionType', TransactionTypeEnum.EXPENSE)}
					>
						<MaterialIcons name="remove" size={18} color="white" />
					</TouchableOpacity>
				</View>
				<TouchableOpacity
					className="bg-deepBlue-600 px-4 py-1 rounded-lg flex-row items-center gap-2"
					onPress={() => setIsCompleteMode(!isCompleteMode)}
				>
					{isCompleteMode ? (
						<MaterialIcons name="check-box" size={18} color="white" />
					) : (
						<MaterialIcons name="check-box-outline-blank" size={18} color="white" />
					)}
					<Text className="text-white font-robotoRegular text-lg">Modo completo</Text>
				</TouchableOpacity>
			</View>
		)
	}
	const renderForm = () => {
		return (
			<>
				<View className="flex-row w-full mt-4">
					<Controller
						control={control}
						name="amount"
						render={({ field }) => (
							<CurrencyInput value={field.value} onChange={field.onChange} minValue={1} placeholder="Monto" />
						)}
					/>
				</View>
				{isCompleteMode && (
					<>
						<View className="flex-col w-full mt-4">
							<Controller
								control={control}
								name="category"
								render={({ field }) => (
									<AutoSuggestInput
										placeholder="Categoria"
										value={field.value}
										onChange={field.onChange}
										searchItems={handleSearchCategories}
									/>
								)}
							/>
						</View>
						<View className="flex-col w-full mt-4">
							<Controller
								control={control}
								name="account"
								render={({ field }) => (
									<AutoSuggestInput
										placeholder="Cuenta"
										value={field.value}
										onChange={field.onChange}
										searchItems={handleSearchAccounts}
									/>
								)}
							/>
						</View>
					</>
				)}
				<View className="flex-row w-full mt-4">
					<Controller
						control={control}
						name="description"
						render={({ field }) => (
							<TextInput
								className="p-4 w-full bg-deepBlue-600 rounded-lg text-white text-2xl font-robotoBlack placeholder:text-deepBlue-700"
								placeholder="Descripción"
								value={field.value}
								onChangeText={field.onChange}
							/>
						)}
					/>
				</View>
			</>
		)
	}
	const renderFooter = () => {
		return (
			<View className="flex-row w-full mt-4 justify-end">
				<TouchableOpacity
					className={`${transactionType === TransactionTypeEnum.INCOME ? 'bg-primary-500' : 'bg-secondary-500'} px-4 py-2 rounded-lg`}
					onPress={handleSubmit(handleSaveTransaction)}
				>
					<Text className="text-white font-robotoRegular text-lg">Guardar</Text>
				</TouchableOpacity>
			</View>
		)
	}

	return (
		<View className="flex-1 justify-center bg-deepBlue-900 flex-col p-4">
			{renderHeader()}
			{renderHeaderActions()}
			{renderForm()}
			{renderFooter()}
		</View>
	)
}
