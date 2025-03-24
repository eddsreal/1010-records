import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { useNumbers } from '@/common/hooks/utilities/use-numbers.hook'
import { colors } from '@/common/styles/colors.styles'
import { useForecastsStore } from '@/stores/forecasts.store'
import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts'
import { LineChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import * as incomeVsExpense from 'echarts/core'
import { EChartsOption, EChartsType } from 'echarts/types/dist/shared'
import { useEffect, useRef, useState } from 'react'
import { Dimensions } from 'react-native'

incomeVsExpense.registerTheme('ivse', {
	backgroundColor: 'transparent',
})
incomeVsExpense.use([LineChart, SkiaRenderer, TooltipComponent])

interface ProjectedVsExecutedGraphData {
	month: string
	income: number
	expense: number
}

const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export const IncomeVsExpenseGraph = () => {
	const { formatCompactNumber } = useNumbers()
	const skiaRef = useRef<any>(null)
	const { type, year } = useForecastsStore()
	const { getIncomeByForecastTypeAndTransactionType } = useForecasts()
	const [data, setData] = useState<ProjectedVsExecutedGraphData[]>([])

	useEffect(() => {
		const getData = async () => {
			const data = await getIncomeByForecastTypeAndTransactionType({ forecastType: type })
			const dataFormatted = months.map((month, index) => {
				const income = data.find((item) => item.month === index + 1 && item.transactionType === 'INCOME')?.amount || 0
				const expense = data.find((item) => item.month === index + 1 && item.transactionType === 'EXPENSE')?.amount || 0
				return {
					month,
					income,
					expense,
				}
			}) as ProjectedVsExecutedGraphData[]
			setData(dataFormatted)
		}
		getData()
	}, [type, year])

	useEffect(() => {
		const option: EChartsOption = {
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true,
			},
			xAxis: [
				{
					type: 'category',
					data: months,
				},
			],
			tooltip: {
				trigger: 'axis',
			},
			yAxis: [
				{
					type: 'value',
					axisLabel: {
						formatter: (value: number) => formatCompactNumber(value),
					},
					splitLine: {
						show: false,
					},
				},
			],
			series: [
				{
					name: 'Entradas',
					type: 'line',
					color: colors.primary,
					data: data.map((item) => item.income),
				},
				{
					name: 'Salidas',
					type: 'line',
					color: colors.secondary,
					data: data.map((item) => item.expense),
				},
			],
		}
		let chart: EChartsType | undefined
		if (skiaRef.current) {
			chart = incomeVsExpense.init(skiaRef.current, 'ivse', {
				renderer: 'svg' as const,
				width: Dimensions.get('window').width,
				height: 300,
			})
			chart.setOption(option)
		}
		return () => chart?.dispose()
	}, [data])

	return <SkiaChart ref={skiaRef} />
}
