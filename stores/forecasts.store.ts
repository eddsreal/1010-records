import { ForecastType } from '@/common/enums/forecast.enum'
import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import { Category, Forecast, ForecastDetail, PaymentMethod } from '@/common/hooks/database/schema'
import { create } from 'zustand'
import { PriorityWithCategories } from './priorities.store'

export type ForecastDetailPopulated = ForecastDetail & {
	paymentMethod?: PaymentMethod
	category?: Category
	priority?: PriorityWithCategories
}
export type MonthValues = {
	[key: string]: number
}
export type ForecastDetailElement = {
	category?: Category
	id: number
	forecastDetailId?: number
	monthsValues?: MonthValues
	priorityId: number
	transactionType: TransactionTypeEnum
}

type ForecastsStoreType = {
	editForecastDetail: ForecastDetailElement | undefined
	forecastsDetailElement: ForecastDetailElement[]
	refreshForecasts: boolean
	relativeDates: { startDate: string; endDate: string } | undefined
	transactionType: TransactionTypeEnum
	type: ForecastType
	year: number
	yearForecast: Forecast | undefined
	refreshGraphs: boolean
}

export const useForecastsStore = create<ForecastsStoreType>()((set) => ({
	editForecastDetail: undefined,
	forecastsDetailElement: [],
	refreshForecasts: false,
	relativeDates: undefined,
	transactionType: TransactionTypeEnum.INCOME,
	type: ForecastType.PROJECTED,
	year: new Date().getFullYear(),
	yearForecast: undefined,
	refreshGraphs: false,
}))
