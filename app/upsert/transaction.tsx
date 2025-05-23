import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import { Transaction } from '@/common/hooks/database/schema'
import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { usePaymentMethods } from '@/common/hooks/database/use-payment-methods.hook'
import { usePriorities } from '@/common/hooks/database/use-priorities.hook'
import { useTransactions } from '@/common/hooks/database/use-transactions.hook'
import { RelativeDateEnum, useDates } from '@/common/hooks/utilities/use-dates.hook'
import { useNumbers } from '@/common/hooks/utilities/use-numbers.hook'
import { useForecastsStore } from '@/stores/forecasts.store'
import { useMenuStore } from '@/stores/menu.store'
import { usePaymentMethodsStore } from '@/stores/payment-methods.store'
import { usePrioritiesStore } from '@/stores/priorities.store'
import { useTransactionsStore } from '@/stores/transactions.store'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { AutoSuggestInput, AutoSuggestItem } from '../../components/atoms/auto-suggest-input.atom'
import { CurrencyInput } from '../../components/atoms/currency-input.atom'
import { PickerAtom } from '../../components/atoms/picker-atom'
interface ForecastComparison {
	proyected: number
	executed: number
	difference: number
}

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
	paymentMethod: AutoSuggestItem | null
	transactionType: TransactionTypeEnum
}

export default function UpsertTransaction() {
	const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption | null>(periodOptions[0])
	const [date, setDate] = useState<Date>(new Date())
	const { editTransaction } = useTransactionsStore()
	const { priorities } = usePrioritiesStore()
	const { paymentMethods } = usePaymentMethodsStore()
	const { getCagetoriesByQueryAndType } = usePriorities()
	const { getPaymentMethodByQuery } = usePaymentMethods()
	const { createTransaction } = useTransactions()
	const { getRelativeDates } = useDates()
	const { transactionType: defaultTransactionType } = useForecastsStore()
	const { getForecastComparison } = useForecasts()
	const [forecastComparison, setForecastComparison] = useState<ForecastComparison | null>(null)
	const { formatToCurrency } = useNumbers()

	const { control, handleSubmit, watch, setValue, reset } = useForm<NewTransactionForm>({
		defaultValues: {
			description: '',
			category: null,
			paymentMethod: null,
			transactionType: defaultTransactionType,
		},
	})

	const transactionType = watch('transactionType')
	const category = watch('category')
	const amount = watch('amount')

	const handleSearchCategories = async (search: string) => {
		const categories = await getCagetoriesByQueryAndType(search, transactionType)
		return categories.map((category) => ({
			...category,
			icon: category.icon || '',
			color: category.color || undefined,
			priorityId: category.priorityId ?? undefined,
		}))
	}

	const handleSearchPaymentMethods = async (search: string) => {
		const paymentMethods = await getPaymentMethodByQuery(search)
		return paymentMethods.map((paymentMethod) => ({
			...paymentMethod,
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
			paymentMethodId: data.paymentMethod?.id ? Number(data.paymentMethod.id) : null,
			type: data.transactionType,
			createdAt: new Date(date),
			updatedAt: new Date(),
			id: editTransaction?.id,
		}

		await createTransaction(transaction as Transaction)
		useForecastsStore.setState({ refreshGraphs: true })

		reset()

		router.dismissAll()
		useMenuStore.setState({ currentRoute: '/' })
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

			const formattedCategory = categoryObject
				? {
						id: categoryObject.id.toString(),
						name: categoryObject.name,
						icon: categoryObject.icon || '',
						color: categoryObject.color || undefined,
						priorityId: categoryObject.priorityId ?? undefined,
					}
				: null

			const paymentMethodObject = paymentMethods.find(
				(paymentMethod) => paymentMethod.id === editTransaction.paymentMethodId,
			)
			const formattedPaymentMethod = paymentMethodObject
				? {
						id: paymentMethodObject.id.toString(),
						name: paymentMethodObject.name,
						icon: '',
						color: undefined,
					}
				: null

			reset({
				amount: editTransaction.amount,
				description: editTransaction.description ?? '',
				category: formattedCategory,
				paymentMethod: formattedPaymentMethod,
				transactionType: editTransaction.type as TransactionTypeEnum,
			})
		}
	}, [editTransaction, priorities, paymentMethods])

	useEffect(() => {
		const fetchForecastComparison = async () => {
			const forecastComparison = await getForecastComparison({
				categoryId: category?.id ? Number(category.id) : undefined,
				priorityId: category?.priorityId ? Number(category.priorityId) : undefined,
				month: date.getMonth(),
				amount: amount,
			})
			setForecastComparison(forecastComparison)
		}
		if (category && amount > 0 && date) {
			fetchForecastComparison()
		}
	}, [category, amount, date])

	const renderHeader = () => {
		return (
			<View className="flex-row items-center justify-between gap-2 w-full mb-8">
				<Text
					className={`${transactionType === TransactionTypeEnum.INCOME ? 'text-primary-500' : 'text-secondary-500'} text-4xl font-robotoBold mb-4`}
				>
					Registro
				</Text>
				<TouchableOpacity onPress={() => router.dismissAll()}>
					<MaterialIcons name="close" size={36} color="white" />
				</TouchableOpacity>
			</View>
		)
	}
	const renderHeaderActions = () => {
		return (
			<View className="flex-row gap-2 justify-between mb-4">
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
						name="paymentMethod"
						render={({ field }) => (
							<AutoSuggestInput
								placeholder="Método de pago"
								value={field.value}
								onChange={field.onChange}
								searchItems={handleSearchPaymentMethods}
							/>
						)}
					/>
				</View>
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
	const renderProjectedComparison = () => {
		return (
			<View className="flex-col w-full mt-4 justify-end">
				<Text className="text-primary-500 font-robotoBold text-2xl">Comparación</Text>
				<View className="flex-row w-full justify-between">
					<View className="flex-col items-start gap-2 w-1/2">
						<Text className="text-white font-robotoRegular text-lg capitalize">Mes: {moment(date).format('MMMM')}</Text>
						<Text className="text-white font-robotoRegular text-lg">
							Proyectado: {formatToCurrency(forecastComparison?.proyected ?? 0)}
						</Text>
						<Text className="text-white font-robotoRegular text-lg">
							Ejecutado: {formatToCurrency(forecastComparison?.executed ?? 0)}
						</Text>
					</View>
					<View className="flex-col items-start gap-2 w-1/2">
						<Text className="text-white font-robotoRegular text-lg">
							{forecastComparison?.difference && forecastComparison?.difference > 0
								? `Excelente ${formatToCurrency(forecastComparison?.difference ?? 0)} disponibles para este mes`
								: `Oops! te excediste ${formatToCurrency(forecastComparison?.difference ?? 0)} para este mes`}
						</Text>
					</View>
				</View>
			</View>
		)
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			className="flex-1 bg-deepBlue-900"
			keyboardVerticalOffset={62}
		>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
				{renderHeader()}
				{renderHeaderActions()}
				{renderForm()}
				{category && amount > 0 && renderProjectedComparison()}
				{renderFooter()}
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
