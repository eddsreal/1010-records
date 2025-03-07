import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import * as schema from '@/database/schema'
import { Forecast, ForecastDetail } from '@/database/schema'
import { useForecastsStore } from '@/stores/forecasts.store'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
import { ForecastType } from '../../enums/forecast.enum'

const expoDb = openDatabaseSync('1010records')
const db = drizzle(expoDb)

interface ForecastFilter {}
export type MonthValues = {
	[key: string]: number
}

export function useForecasts() {
	const { year, yearForecast, forecastDetailModal } = useForecastsStore()

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

	const getForecastDetail = async (args: { accountId?: number; priorityId?: number }) => {
		if (args.accountId) {
			const forecastDetail = await db
				.select()
				.from(schema.forecastDetails)
				.where(eq(schema.forecastDetails.accountId, args.accountId))

			return forecastDetail
		}

		if (args.priorityId) {
			const forecastDetail = await db
				.select()
				.from(schema.forecastDetails)
				.where(eq(schema.forecastDetails.priorityId, args.priorityId))

			return forecastDetail
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

	return {
		getForecasts,
		getForecastDetail,
		saveForecastDetailProjected,
	}
}
