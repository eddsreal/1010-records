import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { RelativeDateEnum, useDates } from '@/common/hooks/utilities/use-dates.hook'
import { useNumbers } from '@/common/hooks/utilities/use-numbers.hook'
import { PickerAtom } from '@/components/atoms/picker-atom'
import { NewTransaction } from '@/components/molecules/new-transaction.molecule'
import { ProjectedVsExecutedGraph } from '@/components/molecules/projected-vs-executed.graph'
import { useForecastsStore } from '@/stores/forecasts.store'
import { MaterialIcons } from '@expo/vector-icons'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface PeriodOption {
	label: string
	value: RelativeDateEnum
}

const periodOptions: PeriodOption[] = [
	{ label: 'Este mes', value: RelativeDateEnum.THIS_MONTH },
	{ label: 'Este año', value: RelativeDateEnum.THIS_YEAR },
	{ label: 'Últimos 3 meses', value: RelativeDateEnum.LAST_3_MONTHS },
	{ label: 'Últimos 6 meses', value: RelativeDateEnum.LAST_6_MONTHS },
	{ label: 'Últimos 24 meses', value: RelativeDateEnum.LAST_24_MONTHS },
]

export default function Index() {
	const navigation = useNavigation()
	const { formatToCurrency } = useNumbers()
	const { getRelativeDates } = useDates()
	const insets = useSafeAreaInsets()
	const { transactionType, relativeDates } = useForecastsStore()
	const { getForecastExecutedAmountByType } = useForecasts()
	const isIncome = transactionType === TransactionTypeEnum.INCOME
	const typeText = isIncome ? 'Entradas' : 'Salidas'
	const [forecastExecutedAmount, setForecastExecutedAmount] = useState(0)
	const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption | null>(periodOptions[0])
	const [modalVisible, setModalVisible] = useState(false)

	const fetchData = async () => {
		const forecastExecutedAmount = await getForecastExecutedAmountByType({
			transactionType,
			startDate: relativeDates?.startDate || '',
			endDate: relativeDates?.endDate || '',
		})
		setForecastExecutedAmount(forecastExecutedAmount)
	}
	useEffect(() => {
		fetchData()
	}, [transactionType, relativeDates])

	useEffect(() => {
		fetchData()
	}, [])

	useEffect(() => {
		if (selectedPeriod) {
			const { startDate, endDate } = getRelativeDates(moment().format(), selectedPeriod.value as RelativeDateEnum)
			useForecastsStore.setState({ relativeDates: { startDate: startDate.format(), endDate: endDate.format() } })
		}
	}, [selectedPeriod])

	return (
		<View
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
			className="flex-col h-full bg-deepBlue-800 p-8 justify-between"
		>
			<View className="flex-row justify-between w-full pt-8">
				<View className="flex-row items-center">
					<Pressable className="border border-black p-2 rounded-full" onPress={() => router.push('/transactions')}>
						<MaterialIcons name="list" size={18} color="white" />
					</Pressable>
				</View>

				<View className="flex-col items-center">
					<TouchableOpacity
						className={`${isIncome ? 'flex-row' : 'flex-row-reverse'} items-center gap-1`}
						onPress={() => {
							useForecastsStore.setState({
								transactionType: isIncome ? TransactionTypeEnum.EXPENSE : TransactionTypeEnum.INCOME,
							})
						}}
					>
						<Text className="text-white font-robotoBold text-3xl">{typeText}</Text>
						<MaterialIcons
							name={isIncome ? 'chevron-right' : 'chevron-left'}
							size={24}
							className={`${isIncome ? '!text-primary-500' : '!text-secondary-500'}`}
							color="white"
						/>
					</TouchableOpacity>
					<View className="flex-row items-center gap-2">
						<Text className="text-white font-robotoLight">Total</Text>
						<Text className={`${isIncome ? 'text-primary-500' : 'text-secondary-500'} font-robotoMedium`}>
							{isIncome
								? `+${formatToCurrency(forecastExecutedAmount)}`
								: `-${formatToCurrency(forecastExecutedAmount)}`}
						</Text>
					</View>
				</View>

				<View className="flex-row items-center">
					<Pressable
						className="border border-black p-2 rounded-full"
						onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
					>
						<MaterialIcons name="settings" size={18} color="white" />
					</Pressable>
				</View>
			</View>

			<View className="flex-col justify-center w-full">
				<View className="flex-row items-center justify-center gap-4">
					<View className={`${isIncome ? 'bg-primary-500' : 'bg-secondary-500'} p-2 rounded-full`}>
						<MaterialIcons name={isIncome ? 'add' : 'remove'} size={12} color="white" />
					</View>
					<View className="flex-row items-center gap-1">
						<Text className="text-white font-robotoBlack text-6xl">{formatToCurrency(forecastExecutedAmount)}</Text>
					</View>
				</View>
				<View className="flex-row justify-center gap-2">
					<View className="flex-row items-center gap-1 bg-deepBlue-500 px-4 rounded-md">
						<PickerAtom
							label="Periodo"
							options={periodOptions}
							value={selectedPeriod ? selectedPeriod.value : ''}
							onChange={(value) => {
								setSelectedPeriod(periodOptions.find((period) => period.value === value) || null)
							}}
						/>
					</View>
				</View>
			</View>

			<View className="w-full">
				<ProjectedVsExecutedGraph />
			</View>

			<View className="flex-col justify-center w-full py-10">
				<View className="flex-row items-center justify-center">
					<Pressable
						className={`shadow-lg ${isIncome ? 'bg-primary-500 shadow-primary-300' : 'bg-secondary-500 shadow-secondary-300'} p-2 rounded-full`}
						onPress={() => {
							setModalVisible(true)
						}}
					>
						<MaterialIcons name="add" size={48} color="white" />
					</Pressable>
				</View>
			</View>

			<Modal
				transparent={true}
				visible={modalVisible}
				animationType="slide"
				onRequestClose={() => setModalVisible(false)}
			>
				<NewTransaction onClose={() => setModalVisible(false)} />
			</Modal>
		</View>
	)
}
