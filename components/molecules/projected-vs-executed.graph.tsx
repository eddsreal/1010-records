import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { useNumbers } from '@/common/hooks/utilities/use-numbers.hook'
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
	projected: number
	executed: number
}

export const ProjectedVsExecutedGraph = () => {
	const { formatCompactNumber } = useNumbers()
	const skiaRef = useRef<any>(null)
	const { transactionType, relativeDates } = useForecastsStore()
	const { getProjectedVsExecutedByCategoryAndType } = useForecasts()
	const [data, setData] = useState<ProjectedVsExecutedGraphData[]>([])

	useEffect(() => {
		const fetchData = async () => {
			const data = await getProjectedVsExecutedByCategoryAndType({
				transactionType,
				startDate: relativeDates?.startDate || '',
				endDate: relativeDates?.endDate || '',
			})

			const xAxisData: Set<string> = new Set()
			data.forEach((item) => {
				if (item.categoryId) {
					xAxisData.add(`${item.icon} - ${item.category}`)
				}
			})
			setData(
				data
					.map((item) => ({
						name: `${item.icon} - ${item.category}`,
						projected: Number(item.projected) || 0,
						executed: Number(item.executed) || 0,
					}))
					.sort((a, b) => b.executed - a.executed),
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
				return `${params.name.split('-')[1]} - ${formatCompactNumber(params.value)}`
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
						formatter: function (params: any) {
							return `${params?.split('-')[0]}`
						},
					},
					data: data.map((item) => item.name),
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
					label: { ...labelOption, color: '#fff' },
					emphasis: {
						focus: 'series',
					},
					data: data.map((item) => item.projected),
					itemStyle: {
						borderRadius: [10, 10, 0, 0],
						color: '#232B5D',
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
						color: transactionType === TransactionTypeEnum.EXPENSE ? '#FF3B30' : '#00C49F',
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
