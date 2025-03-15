import { ForecastType } from '@/common/enums/forecast.enum'
import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { useNumbers } from '@/common/hooks/utilities/use-numbers.hook'
import { useForecastsStore } from '@/stores/forecasts.store'
import { usePrioritiesStore } from '@/stores/priorities.store'
import React, { useEffect, useState } from 'react'
import { Dimensions, Text, View } from 'react-native'
import { PieChart, pieDataItem } from 'react-native-gifted-charts'
export const PriorityAllocationGraph = () => {
	const { priorities } = usePrioritiesStore()
	const { type } = useForecastsStore()
	const { getAllocationPercentageByPriority } = useForecasts()
	const { formatToCurrency } = useNumbers()
	const [pieData, setPieData] = useState<pieDataItem[]>([])
	const [totalIncome, setTotalIncome] = useState<number>(0)

	useEffect(() => {
		const data = async () => {
			const data = await getAllocationPercentageByPriority({ type })
			setTotalIncome(Number(data.totalIncome || 0))
			data.priorities.forEach((item) => {
				if (item) {
					setPieData((prev) => [
						...prev,
						{
							value: item.percentage,
							color: item.color || '#006DFF',
							tooltipComponent: () => {
								return (
									<View className="justify-center items-center rounded-md p-4 bg-secondary bg-opacity-20">
                    <Text className="text-white text-sm">{item.name}</Text>
                    <Text className="text-white font-bold">{formatToCurrency(Number(item.amount))}</Text>
										<Text className="text-white text-sm">{item.percentage.toFixed(2)}%</Text>
									</View>
								)
							},
						},
					])
				}
			})
		}
		data()
		return () => {
			setPieData([])
			setTotalIncome(0)
		}
	}, [priorities])

	const renderDot = (color: string) => {
		return (
			<View
				style={{
					height: 10,
					width: 10,
					borderRadius: 5,
					backgroundColor: color,
					marginRight: 10,
				}}
			/>
		)
	}

	const renderLegendComponent = () => {
		return (
			<View className="flex-row flex-wrap justify-center gap-3">
				{priorities
					.filter((priority) => priority.priorityType === TransactionTypeEnum.EXPENSE)
					.map((priority) => (
						<View key={priority.id} className="flex-row items-center w-32 mr-5">
							{renderDot(priority.color || '#006DFF')}
							<Text className="text-app-gray opacity-70">{priority.name}</Text>
						</View>
					))}
			</View>
		)
	}

	return (
		<View className="p-4">
			<View className="rounded-2xl">
				<Text className="text-secondary text-lg font-bold text-center">
					Concentración de prioridades
					{type === ForecastType.PROJECTED ? 'proyectado' : 'ejecutado'}
				</Text>
				<View className="items-center">
					<PieChart
						data={pieData}
						donut
						sectionAutoFocus
						radius={Dimensions.get('window').width / 2.2}
						showTooltip
						tooltipDuration={3000}
						innerRadius={100}
						centerLabelComponent={() => {
							return (
								<View className="justify-center items-center rounded-full p-2">
									<Text className="text-app-gray text-2xl font-bold">{formatToCurrency(totalIncome)}</Text>
									<Text className="text-app-gray text-sm">Total Ingresos</Text>
								</View>
							)
						}}
					/>
				</View>
				{renderLegendComponent()}
			</View>
		</View>
	)
}
