import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import * as schema from '@/database/schema'
import { Forecast, ForecastDetail } from '@/database/schema'
import { useForecastsStore } from '@/stores/forecasts.store'
import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
import { useEffect } from 'react'
import { ForecastType } from '../../enums/forecast.enum'

const expoDb = openDatabaseSync('1010records')
const db = drizzle(expoDb)

interface ForecastFilter {}
export type MonthValues = {
	[key: string]: number
}

interface ForecastComparison {
	proyected: number
	isMoreThanProyected: boolean
	isZero: boolean
	difference: number
	executed: number
}

export function useForecasts() {
	const { year, yearForecast, forecastDetailModal, refreshForecasts } = useForecastsStore()

	useEffect(() => {
		getForecasts()
	}, [refreshForecasts])

	const getForecasts = async () => {
		let resultYearForecast: Forecast[] = await db.select().from(schema.forecasts).where(eq(schema.forecasts.year, year))

		if (!resultYearForecast.length) {
			await db.insert(schema.forecasts).values({
				year,
			})
			resultYearForecast = await db.select().from(schema.forecasts).where(eq(schema.forecasts.year, year))
		}

		useForecastsStore.setState({
			yearForecast: resultYearForecast?.[0],
		})
	}

	const getForecastDetail = async (args: {
		accountId?: number
		priorityId?: number
		categoryId?: number
		forecastType?: ForecastType
		month?: number
	}) => {
		if (args.accountId && !args.month) {
			const forecastDetail = await db
				.select()
				.from(schema.forecastDetails)
				.where(
					and(
						eq(schema.forecastDetails.accountId, args.accountId),
						eq(schema.forecastDetails.forecastType, args.forecastType ?? ForecastType.PROJECTED),
					),
				)

			return forecastDetail
		}

		if (args.priorityId && !args.month) {
			const forecastDetail = await db
				.select()
				.from(schema.forecastDetails)
				.where(
					and(
						eq(schema.forecastDetails.priorityId, args.priorityId),
						eq(schema.forecastDetails.forecastType, args.forecastType ?? ForecastType.PROJECTED),
					),
				)

			return forecastDetail
		}

		if (args.month && args.priorityId && args.categoryId) {
			const forecastDetail = await db
				.select()
				.from(schema.forecastDetails)
				.where(
					and(
						eq(schema.forecastDetails.month, args.month),
						eq(schema.forecastDetails.forecastType, args.forecastType ?? ForecastType.PROJECTED),
						eq(schema.forecastDetails.priorityId, args.priorityId),
						eq(schema.forecastDetails.categoryId, args.categoryId),
					),
				)

			return forecastDetail
		}
	}

	const getForecastComparison = async (args: {
		priorityId?: number
		categoryId?: number
		month: number
		amount: number
	}): Promise<ForecastComparison> => {
		const forecastDetailProjected = await getForecastDetail({
			priorityId: args.priorityId,
			categoryId: args.categoryId,
			month: args.month,
		})
		const proyected = forecastDetailProjected?.reduce((acc, curr) => acc + curr.amount, 0) || 0
		const forecastDetailExecuted = await getForecastDetail({
			priorityId: args.priorityId,
			categoryId: args.categoryId,
			month: args.month,
			forecastType: ForecastType.EXECUTED,
		})
		const executed = forecastDetailExecuted?.reduce((acc, curr) => acc + curr.amount, 0) || 0
		const isMoreThanProyected = executed + args.amount > proyected
		const isZero = proyected - executed - args.amount === 0

		return {
			proyected,
			isMoreThanProyected,
			isZero,
			difference: proyected - executed - args.amount,
			executed,
		}
	}

	const saveForecastDetailProjected = async (data: MonthValues, forecastDetail: ForecastDetail[]) => {
		for (const key of Object.keys(data)) {
			const monthIndex = parseInt(key)
			const monthNumber = monthIndex

			const innerForecastDetail = {
				month: monthNumber,
				amount: data[key],
				priorityId: forecastDetailModal?.priority?.id,
				categoryId: forecastDetailModal?.category?.id,
				accountId: forecastDetailModal?.account?.id,
				forecastType: ForecastType.PROJECTED,
				forecastId: yearForecast?.id,
				transactionType:
					forecastDetailModal?.transactionType ??
					(forecastDetailModal?.account ? TransactionTypeEnum.INCOME : TransactionTypeEnum.EXPENSE),
				id: forecastDetail?.find((fd) => fd.month === monthNumber)?.id,
			} as ForecastDetail

			await db
				.insert(schema.forecastDetails)
				.values(innerForecastDetail)
				.onConflictDoUpdate({
					target: [schema.forecastDetails.id],
					set: { amount: data[key] },
				})
		}

		useForecastsStore.setState({
			forecastDetailModal: undefined,
		})
	}

	const saveForecastDetailExecuted = async (forecastDetail: ForecastDetail) => {
		await db
			.insert(schema.forecastDetails)
			.values(forecastDetail)
			.onConflictDoUpdate({
				target: [schema.forecastDetails.id],
				set: { amount: forecastDetail.amount },
			})
	}

	return {
		getForecasts,
		getForecastDetail,
		getForecastComparison,
		saveForecastDetailProjected,
		saveForecastDetailExecuted,
	}
}
