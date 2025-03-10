import { ForecastType } from '@/common/enums/forecast.enum'
import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import { Account, Category, Forecast, ForecastDetail } from '@/database/schema'
import { create } from 'zustand'
import { PriorityWithCategories } from './priorities.store'

export type ForecastDetailPopulated = ForecastDetail & {
	priority?: PriorityWithCategories
	account?: Account
	category?: Category
}

type ForecastsStoreType = {
	year: number
	type: ForecastType
	transactionType: TransactionTypeEnum
	yearForecast: Forecast | undefined
	forecastsDetail: ForecastDetailPopulated[]
	forecastDetailModal: Partial<ForecastDetailPopulated> | undefined
	refreshForecasts: boolean
}

export const useForecastsStore = create<ForecastsStoreType>()((set) => ({
	year: new Date().getFullYear(),
	type: ForecastType.PROJECTED,
	transactionType: TransactionTypeEnum.INCOME,
	yearForecast: undefined,
	forecastsDetail: [],
	forecastDetailModal: undefined,
	refreshForecasts: false,
}))
