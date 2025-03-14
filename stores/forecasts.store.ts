import { ForecastType } from '@/common/enums/forecast.enum'
import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import { Account, Category, Forecast, ForecastDetail } from '@/common/hooks/database/schema'
import { create } from 'zustand'
import { PriorityWithCategories } from './priorities.store'

export type ForecastDetailPopulated = ForecastDetail & {
	priority?: PriorityWithCategories
	account?: Account
	category?: Category
}
export type MonthValues = {
	[key: string]: number
}
export type ForecastDetailElement = {
	id: number
	priorityId: number
	category?: Category
	monthsValues: MonthValues
}

type ForecastsStoreType = {
	year: number
	type: ForecastType
	transactionType: TransactionTypeEnum
	yearForecast: Forecast | undefined
	forecastsDetailElement: ForecastDetailElement[]
	forecastDetailModal: Partial<ForecastDetailPopulated> | undefined
	refreshForecasts: boolean
	relativeDates: { startDate: string; endDate: string } | undefined
}

export const useForecastsStore = create<ForecastsStoreType>()((set) => ({
	year: new Date().getFullYear(),
	type: ForecastType.PROJECTED,
	transactionType: TransactionTypeEnum.INCOME,
	yearForecast: undefined,
	forecastsDetailElement: [],
	forecastDetailModal: undefined,
	refreshForecasts: false,
	relativeDates: undefined,
}))
