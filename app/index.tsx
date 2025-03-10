import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { useCurrency } from '@/common/hooks/utilities/use-currency.hook'
import { ProjectedVsExecutedGraph } from '@/components/molecules/projected-vs-executed.graph'
import { useForecastsStore } from '@/stores/forecasts.store'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Index() {
	const { formatToCurrency } = useCurrency()
	const insets = useSafeAreaInsets()
	const { transactionType } = useForecastsStore()
	const { getForecastExecutedAmountByType } = useForecasts()
	const isIncome = transactionType === TransactionTypeEnum.INCOME
	const typeText = isIncome ? 'Entradas' : 'Salidas'
	const [forecastExecutedAmount, setForecastExecutedAmount] = useState(0)

	useEffect(() => {
		const fetchData = async () => {
			const forecastExecutedAmount = await getForecastExecutedAmountByType({ transactionType })
			setForecastExecutedAmount(forecastExecutedAmount)
		}
		fetchData()
	}, [transactionType])

	return (
		<View
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
			className="flex-col h-full bg-deepBlue-800 p-8 justify-between"
		>
			<View className="flex-row justify-between w-full pt-8">
				<View className="flex-row items-center">
					<Pressable className="border border-black p-2 rounded-full">
						<MaterialIcons name="menu" size={18} color="white" />
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
							{isIncome ? `+${formatToCurrency(forecastExecutedAmount)}` : `-${formatToCurrency(forecastExecutedAmount)}`}
						</Text>
					</View>
				</View>

				<View className="flex-row items-center">
					<Pressable className="border border-black p-2 rounded-full">
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
					<View className="flex-row items-center gap-1 bg-deepBlue-500 px-2 rounded-md">
						<Text className="text-white font-robotoRegular text-lg">este mes</Text>
						<MaterialIcons name="chevron-right" size={24} color="white" style={{ transform: [{ rotate: '90deg' }] }} />
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
							router.push('/forecast')
						}}
					>
						<MaterialIcons name="add" size={48} color="white" />
					</Pressable>
				</View>
			</View>
		</View>
	)
}
