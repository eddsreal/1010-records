import { ForecastType } from '@/common/enums/forecast.enum'
import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { colors } from '@/common/styles/colors.styles'
import { ForecastPriorityElement } from '@/components/organisms/forecast/forecast-priority-element.organism'
import { useForecastsStore } from '@/stores/forecasts.store'
import { usePrioritiesStore } from '@/stores/priorities.store'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import PagerView from 'react-native-pager-view'

export default function ForecastWizzardView() {
	const { getForecasts } = useForecasts()
	const { priorities } = usePrioritiesStore()
	const { year, type } = useForecastsStore()
	const [currentPage, setCurrentPage] = useState(0)

	useEffect(() => {
		getForecasts()
	}, [])

	return (
		<View className="flex-1 bg-white">
			<View className="flex-col justify-center items-center gap-2 p-2">
				<View className="flex-row justify-center items-center gap-2">
					<Text className="text-gray-500 text-2xl font-bold">Presupuesto:</Text>
					{type === ForecastType.PROJECTED && (
						<TouchableOpacity
							className="flex-row items-center gap-2"
							onPress={() => {
								useForecastsStore.setState({ type: ForecastType.EXECUTED })
							}}
						>
							<Text className=" text-gray-500 text-2xl font-bold">Proyectado</Text>
							<Ionicons name="chevron-down" color={colors.secondary} size={25} />
						</TouchableOpacity>
					)}
					{type === ForecastType.EXECUTED && (
						<TouchableOpacity
							className="flex-row items-center gap-2"
							onPress={() => {
								useForecastsStore.setState({ type: ForecastType.PROJECTED })
							}}
						>
							<Text className=" text-gray-500 text-2xl font-bold">Ejecutado</Text>
							<Ionicons name="chevron-up" color={colors.secondary} size={25} />
						</TouchableOpacity>
					)}
				</View>
				<Text className="text-sm text-gray-500">Presupuesto del año {year}</Text>
			</View>
			<PagerView
				initialPage={0}
				style={{ flex: 1 }}
				onPageSelected={(e) => {
					setCurrentPage(e.nativeEvent.position)
				}}
			>
				{priorities.map((priority) => (
					<ForecastPriorityElement key={priority.id} priority={priority} />
				))}
			</PagerView>
			<View className="flex-row justify-center items-center gap-2 p-2">
				{priorities.map((priority, index) => {
					const isActive = index === currentPage
					return (
						<TouchableOpacity
							key={priority.id}
							className={`w-3 h-3 bg-secondary rounded-full ${isActive ? 'opacity-100' : 'opacity-20'}`}
						/>
					)
				})}
			</View>
		</View>
	)
}
