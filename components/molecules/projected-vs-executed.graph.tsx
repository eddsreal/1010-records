import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { useCurrency } from '@/common/hooks/utilities/use-currency.hook'
import { useForecastsStore } from '@/stores/forecasts.store'
import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts'
import { BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { useEffect, useRef, useState } from 'react'
import { Dimensions } from 'react-native'

echarts.registerTheme('dark', {
	backgroundColor: 'transparent',
	categoryAxis: {
		axisLine: {
			show: false,
		},
		axisLabel: {
			fontSize: 25,
			fontWeight: 'bold',
			margin: 20,
		},
		axisTick: { show: false },
	},
	legend: {
		textStyle: {
			color: '#FFFFFF',
		},
	},
})
echarts.use([BarChart, LegendComponent, GridComponent, TooltipComponent, SkiaRenderer])

interface ProjectedVsExecutedGraphData {
	name: string
	icon: string
	projected: number
	executed: number
}

export const ProjectedVsExecutedGraph = () => {
	const { formatToCurrency } = useCurrency()
	const skiaRef = useRef<any>(null)
	const { transactionType, relativeDates } = useForecastsStore()
	const { getProjectedVsExecutedByCategoryAndType } = useForecasts()
	const [data, setData] = useState<ProjectedVsExecutedGraphData[]>([])

	useEffect(() => {
		const fetchData = async () => {
			const { projected, executed } = await getProjectedVsExecutedByCategoryAndType({
				transactionType,
				startDate: relativeDates?.startDate || '',
				endDate: relativeDates?.endDate || '',
			})

			const xAxisData: Set<string> = new Set()
			projected.forEach((item) => {
				if (item.account) {
					xAxisData.add(item.account)
				}
				if (item.category) {
					xAxisData.add(item.category)
				}
			})
			executed.forEach((item) => {
				if (item.account) {
					xAxisData.add(item.account)
				}
				if (item.category) {
					xAxisData.add(item.category)
				}
			})
			const labels = Array.from(xAxisData)
			setData(
				labels.map((label) => {
					const projectedItem = projected.find(
						(item: { account?: string | null; category?: string | null }) =>
							item.account === label || item.category === label,
					)
					const executedItem = executed.find(
						(item: { account?: string | null; category?: string | null }) =>
							item.account === label || item.category === label,
					)
					return {
						name: label,
						icon: projectedItem?.icon ?? executedItem?.icon ?? '',
						projected: Number(projectedItem?.amount) || 0,
						executed: Number(executedItem?.amount) || 0,
					}
				}),
			)
		}
		fetchData()
	}, [transactionType, relativeDates])

	useEffect(() => {
		const labelOption = {
			show: true,
			position: 'insideBottom',
			distance: 15,
			align: 'left',
			verticalAlign: 'middle',
			rotate: 90,
			formatter: function (params: any) {
				return `${formatToCurrency(params.value)}`
			},
			rich: {
				name: {},
			},
		}
		const option = {
			legend: {
				data: ['Proyectado', 'Ejecutado'],
			},
			xAxis: [
				{
					type: 'category',
					axisLabel: {
						show: true,
					},
					data: data.map((item) => item.icon),
				},
			],
			yAxis: [
				{
					type: 'value',
					show: false,
				},
			],
			series: [
				{
					name: 'Proyectado',
					type: 'bar',
					barGap: 0,
					label: { ...labelOption, color: '#3F51B5' },
					emphasis: {
						focus: 'series',
					},
					data: data.map((item) => item.projected),
					itemStyle: {
						borderRadius: [10, 10, 0, 0],
						color: '#00e490',
					},
				},
				{
					name: 'Ejecutado',
					type: 'bar',
					label: { ...labelOption, color: '#FFFFFF' },
					emphasis: {
						focus: 'series',
					},
					itemStyle: {
						borderRadius: [10, 10, 0, 0],
						color: '#FF3B30',
					},
					data: data.map((item) => item.executed),
				},
			],
		}
		let chart: any
		if (skiaRef.current) {
			chart = echarts.init(skiaRef.current, 'dark', {
				renderer: 'svg' as any,
				width: Dimensions.get('window').width * 0.87,
				height: 400,
			})
			chart.setOption(option)
		}
		return () => chart?.dispose()
	}, [data])

	return <SkiaChart ref={skiaRef} />
}
