import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { ForecastElement } from '@/components/organisms/forecast/forecast-element.organism'
import { useAccountsStore } from '@/stores/accounts.store'
import { usePrioritiesStore } from '@/stores/priorities.store'
import React, { useEffect } from 'react'
import { View } from 'react-native'
import PagerView from 'react-native-pager-view'

export default function ForecastWizzardView() {
	const { getForecasts } = useForecasts()
	const { priorities } = usePrioritiesStore()
	const { accounts } = useAccountsStore()

	useEffect(() => {
		getForecasts()
	}, [])
	
	return (
		<View className="flex-1 bg-white">
			<PagerView initialPage={0} style={{ flex: 1 }}>
				<ForecastElement accounts={accounts} />
				{priorities.map((priority) => (
					<ForecastElement key={priority.id} priority={priority} />
				))}
			</PagerView>
		</View>
	)
}
