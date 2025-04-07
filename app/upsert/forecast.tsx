import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { useNumbers } from '@/common/hooks/utilities/use-numbers.hook'
import { colors } from '@/common/styles/colors.styles'
import { CurrencyInput } from '@/components/atoms/currency-input.atom'
import { MonthValues, useForecastsStore } from '@/stores/forecasts.store'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { router } from 'expo-router'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Pressable, ScrollView, Text, View } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface FormData {
	baseAmount: number
	'1': number
	'2': number
	'3': number
	'4': number
	'5': number
	'6': number
	'7': number
	'8': number
	'9': number
	'10': number
	'11': number
	'12': number
}

const months = Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
	const monthName = moment(month, 'MM').format('MMMM')
	return {
		monthName,
		monthNumber: month,
	}
})

export default function UpsertForecastView() {
	const insets = useSafeAreaInsets()
	const { formatToCurrency } = useNumbers()
	const { control, reset, watch, setValue, handleSubmit } = useForm<FormData>()
	const { editForecastDetail } = useForecastsStore()
	const { saveForecastDetailProjected, getforecastDetailByCategory, getIncomeByForecastTypeAndTransactionType } = useForecasts()
	const [selectedMonths, setSelectedMonths] = useState<number[]>([])
	const [isSelectedAll, setIsSelectedAll] = useState(false)
	const amount = watch('baseAmount')

	useEffect(() => {
		if (editForecastDetail) {
			reset(editForecastDetail.monthsValues)
		}
		return () => {
			setSelectedMonths([])
			reset()
		}
	}, [editForecastDetail])

	useEffect(() => {
		selectedMonths.forEach((month) => {
			setValue(month.toString() as keyof FormData, amount || 0)
		})
	}, [amount, isSelectedAll])

	const handleCheckedMonths = (monthNumber: number) => {
		if (selectedMonths.includes(monthNumber)) {
			setSelectedMonths(selectedMonths.filter((month) => month !== monthNumber))
		} else {
			setSelectedMonths([...selectedMonths, monthNumber])
			setValue(monthNumber.toString() as keyof FormData, amount || 0)
		}
	}

	const onSubmit = async (data: FormData) => {
		const { baseAmount, ...monthValues } = data
		await saveForecastDetailProjected(monthValues as MonthValues).catch((error) => {
			console.log(error)
		})

		await getforecastDetailByCategory()

		reset()
		router.dismiss(1)
	}

	return (
		<View className="bg-deepBlue-800 h-full p-4" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<ScrollView>
				<View className="flex-row justify-between items-center gap-2 p-2">
					<View className="flex-row items-center gap-2">
						<Text className="text-white text-5xl font-bold">Presupuesto</Text>
					</View>
					<Pressable
						onPress={() => {
							router.push('/forecasts')
							reset()
							setSelectedMonths([])
						}}
					>
						<MaterialIcons name="close" size={24} color="white" />
					</Pressable>
				</View>

				<View className="flex-col justify-between items-center gap-2 p-2">
					<Text className="text-white text-2xl font-bold">
						{Object.keys(editForecastDetail?.monthsValues || {}).length > 0 ? 'Editar' : 'Crear'} presupuesto{' '}
						{editForecastDetail?.category?.name}
					</Text>
					<View className="flex-row w-full mt-4">
						<Controller
							control={control}
							name="baseAmount"
							render={({ field }) => (
								<CurrencyInput value={field.value} onChange={field.onChange} minValue={1} placeholder="Monto" />
							)}
						/>
					</View>
					<View className="flex-row items-center gap-2 p-2">
						<BouncyCheckbox
							fillColor={colors.primary}
							text="Seleccionar todos"
							textStyle={{ color: 'white' }}
							onPress={() => {
								setSelectedMonths(
									selectedMonths.length === months.length ? [] : months.map((month) => month.monthNumber),
								)
								setIsSelectedAll(!isSelectedAll)
							}}
							isChecked={isSelectedAll}
						/>
					</View>
					<View className="flex-row mt-4 gap-2">
						<View className="flex-col gap-2 w-6/12">
							{months
								.filter((month) => month.monthNumber <= 6)
								.map((month) => (
									<View key={month.monthNumber} className="flex-row items-center gap-2 p-2">
										<BouncyCheckbox
											fillColor={colors.primary}
											text={month.monthName}
											textStyle={{ color: 'white' }}
											onPress={() => handleCheckedMonths(month.monthNumber)}
											isChecked={selectedMonths.includes(month.monthNumber)}
										/>
									</View>
								))}
						</View>
						<View className="flex-col gap-2 w-6/12">
							{months
								.filter((month) => month.monthNumber > 6)
								.map((month) => (
									<View key={month.monthNumber} className="flex-row items-center gap-2 p-2">
										<BouncyCheckbox
											fillColor={colors.primary}
											text={month.monthName}
											textStyle={{ color: 'white' }}
											onPress={() => handleCheckedMonths(month.monthNumber)}
											isChecked={selectedMonths.includes(month.monthNumber)}
										/>
									</View>
								))}
						</View>
					</View>
				</View>

				{Object.keys(editForecastDetail?.monthsValues || {}).length > 0 && (
					<View className="flex-col gap-2 mt-8">
						<Text className="text-white text-2xl font-bold">Verifica</Text>
						{Object.keys(editForecastDetail?.monthsValues || {}).map((month) => {
							const monthValue = watch(month as keyof FormData)
							return (
								<View key={month} className="flex-row justify-between items-center gap-2 p-2">
									<Text className="text-white font-robotoRegular capitalize">{moment(month, 'MM').format('MMMM')}</Text>
									<Text className="text-white font-robotoBlack">{formatToCurrency(monthValue || 0)}</Text>
								</View>
							)
						})}
					</View>
				)}

				<View className="flex-row justify-between items-center gap-2 p-2">
					<Pressable className="bg-primary-500 w-full p-4 rounded-md" onPress={handleSubmit(onSubmit)}>
						<Text className="text-white font-robotoBlack text-lg">Guardar</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	)
}
