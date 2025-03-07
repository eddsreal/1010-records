import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { ForecastPriorityElement } from '@/components/organisms/forecast/forecast-priority-element.organism'
import { usePrioritiesStore } from '@/stores/priorities.store'
import React, { useEffect } from 'react'
import { View } from 'react-native'
import PagerView from 'react-native-pager-view'

export default function ForecastWizzardView() {
	const { getForecasts } = useForecasts()
	const { priorities } = usePrioritiesStore()
	useEffect(() => {
		getForecasts()
	}, [])

	return (
		<View className="flex-1 bg-white">
			<PagerView initialPage={0} style={{ flex: 1 }}>
				{priorities.map((priority) => (
					<ForecastPriorityElement key={priority.id} priority={priority} />
				))}
			</PagerView>
		</View>
	)
}
