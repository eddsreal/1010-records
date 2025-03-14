import { ForecastType } from '@/common/enums/forecast.enum'
import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { PickerAtom } from '@/components/atoms/picker-atom'
import { ForecastPriorityElement } from '@/components/molecules/forecast-priority-element.molecule'
import { useForecastsStore } from '@/stores/forecasts.store'
import { usePrioritiesStore } from '@/stores/priorities.store'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text, TouchableOpacity, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Forecasts() {
	const insets = useSafeAreaInsets()
	const { getforecastDetailByCategory } = useForecasts()
	const { year, type } = useForecastsStore()
	const [currentPage, setCurrentPage] = useState(0)
	const { priorities } = usePrioritiesStore()

	useEffect(() => {
		const getData = async () => {
			await getforecastDetailByCategory()
		}
		getData()
	}, [type, year])

	return (
		<View className="flex-1 bg-deepBlue-800" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<View className="flex-row justify-between items-center gap-2 p-2">
				<View className="flex-row items-center gap-2">
					<Text className="text-white text-3xl font-bold">Presupuesto</Text>
				</View>
				<Pressable onPress={() => router.push('/')}>
					<MaterialIcons name="close" size={32} color="white" />
				</Pressable>
			</View>
			<View className="flex-row justify-center items-center gap-2 p-2">
				<PickerAtom
					label="Presupuesto"
					options={Object.values(ForecastType).map((type) => ({
						label: type === ForecastType.PROJECTED ? 'Proyectado' : 'Ejecutado',
						value: type,
					}))}
					value={type}
					onChange={(value) => {
						useForecastsStore.setState({ type: value as ForecastType })
					}}
				/>
				<PickerAtom
					label="Año"
					options={Array.from({ length: 10 }, (_, i) => ({
						label: (2024 + i).toString(),
						value: (2024 + i).toString(),
					}))}
					value={year.toString()}
					onChange={(value) => {
						useForecastsStore.setState({ year: parseInt(value) })
					}}
				/>
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
							className={`w-3 h-3 bg-primary-500 rounded-full ${isActive ? 'opacity-100' : 'opacity-20'}`}
						/>
					)
				})}
			</View>
		</View>
	)
}
