import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import * as schema from '@/common/hooks/database/schema'
import { Forecast, ForecastDetail } from '@/common/hooks/database/schema'
import { ForecastDetailElement, MonthValues, useForecastsStore } from '@/stores/forecasts.store'
import { and, eq, gte, lte, sql, sum } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
import moment from 'moment'
import { useEffect } from 'react'
import { ForecastType } from '../../enums/forecast.enum'
const expoDb = openDatabaseSync('1010records')
const db = drizzle(expoDb)

interface ForecastComparison {
	proyected: number
	isMoreThanProyected: boolean
	isZero: boolean
	difference: number
	executed: number
}

export function useForecasts() {
	const { year, type, yearForecast, editForecastDetail, refreshForecasts } = useForecastsStore()

	useEffect(() => {
		getForecasts()
		getforecastDetailByCategory()
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
		paymentMethodId?: number
		priorityId?: number
		categoryId?: number
		forecastType?: ForecastType
		month?: number
		year?: number
	}) => {
		if (args.paymentMethodId && !args.month) {
			const forecastDetail = await db
				.select()
				.from(schema.forecastDetails)
				.where(
					and(
						eq(schema.forecastDetails.paymentMethodId, args.paymentMethodId),
						eq(schema.forecastDetails.forecastType, args.forecastType ?? ForecastType.PROJECTED),
						eq(schema.forecastDetails.year, args.year ?? year),
					),
				)

			return forecastDetail
		}

		if (args.priorityId && !args.categoryId && !args.month) {
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

		if (args.categoryId && args.priorityId && !args.month) {
			const forecastDetail = await db
				.select()
				.from(schema.forecastDetails)
				.where(
					and(
						eq(schema.forecastDetails.categoryId, args.categoryId),
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

	const saveForecastDetailProjected = async (data: MonthValues) => {
		for (const key of Object.keys(data)) {
			const innerForecastDetail = {
				month: parseInt(key),
				amount: parseFloat(data[key].toString()),
				priorityId: editForecastDetail?.priorityId,
				categoryId: editForecastDetail?.category?.id,
				forecastType: ForecastType.PROJECTED,
				forecastId: yearForecast?.id,
				transactionType: editForecastDetail?.transactionType,
				updatedAt: new Date(),
				year: year,
			} as ForecastDetail

			const forecastDetail = await db
				.select()
				.from(schema.forecastDetails)
				.where(
					and(
						eq(schema.forecastDetails.categoryId, innerForecastDetail?.categoryId ?? 0),
						eq(schema.forecastDetails.forecastId, innerForecastDetail?.forecastId ?? 0),
						eq(schema.forecastDetails.priorityId, innerForecastDetail?.priorityId ?? 0),
						eq(schema.forecastDetails.month, innerForecastDetail?.month ?? 0),
						eq(schema.forecastDetails.year, innerForecastDetail?.year ?? 0),
						eq(schema.forecastDetails.forecastType, ForecastType.PROJECTED),
					),
				)

			innerForecastDetail.id = forecastDetail?.[0]?.id

			await db
				.insert(schema.forecastDetails)
				.values(innerForecastDetail)
				.onConflictDoUpdate({
					target: [schema.forecastDetails.id],
					set: { amount: innerForecastDetail.amount, updatedAt: innerForecastDetail.updatedAt },
				})
		}

		useForecastsStore.setState({
			editForecastDetail: undefined,
			refreshForecasts: true,
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

	const getAllocationPercentageByPriority = async (args: { type: ForecastType }) => {
		const totalIncome = await db
			.select({
				amount: sum(schema.forecastDetails.amount),
			})
			.from(schema.forecastDetails)
			.where(
				and(
					eq(schema.forecastDetails.forecastId, sql`${yearForecast!.id}`),
					eq(schema.forecastDetails.transactionType, TransactionTypeEnum.INCOME),
					eq(schema.forecastDetails.forecastType, args.type),
				),
			)

		const amountByPriority = await db
			.select({
				amount: sum(schema.forecastDetails.amount),
				id: schema.priorities.id,
				name: schema.priorities.name,
				color: schema.priorities.color,
			})
			.from(schema.forecastDetails)
			.leftJoin(schema.priorities, eq(schema.forecastDetails.priorityId, schema.priorities.id))
			.where(
				and(
					eq(schema.forecastDetails.forecastId, sql`${yearForecast!.id}`),
					eq(schema.forecastDetails.transactionType, TransactionTypeEnum.EXPENSE),
					eq(schema.forecastDetails.forecastType, args.type),
				),
			)
			.groupBy(schema.priorities.id)
			.orderBy(schema.priorities.id)

		const allocationPercentageByPriority = amountByPriority.map((priority) => {
			if (priority.amount && totalIncome[0].amount) {
				return {
					id: priority.id,
					name: priority.name,
					color: priority.color,
					amount: priority.amount,
					percentage: (Number(priority.amount) / Number(totalIncome[0].amount)) * 100,
				}
			}
		})

		const totalPercentage = allocationPercentageByPriority.reduce((acc, curr) => acc + (curr?.percentage ?? 0), 0)
		const totalAmount = allocationPercentageByPriority.reduce((acc, curr) => acc + (Number(curr?.amount) ?? 0), 0)

		allocationPercentageByPriority.push({
			percentage: 100 - totalPercentage,
			color: '#9ca3af',
			amount: (Number(totalIncome[0].amount) - Number(totalAmount)).toString(),
			name: 'Sin asignar',
			id: 0,
		})

		return {
			totalIncome: totalIncome[0].amount,
			priorities: allocationPercentageByPriority,
		}
	}

	const getProjectedVsExecutedByCategoryAndType = async (args: {
		transactionType: TransactionTypeEnum
		startDate: string
		endDate: string
	}): Promise<{ projected: number; executed: number; icon: string; categoryId: number; category: string }[]> => {
		const month = moment(args.startDate).month() + 1
		const year = moment(args.startDate).year()
		const test = await db
			.select({
				amount: sum(schema.forecastDetails.amount),
				forecastType: schema.forecastDetails.forecastType,
				categoryId: schema.categories.id,
				icon: schema.categories.icon,
				category: schema.categories.name,
			})
			.from(schema.forecastDetails)
			.leftJoin(schema.categories, eq(schema.forecastDetails.categoryId, schema.categories.id))
			.where(
				and(
					eq(schema.forecastDetails.transactionType, args.transactionType),
					gte(schema.forecastDetails.month, month),
					lte(schema.forecastDetails.month, month),
					gte(schema.forecastDetails.year, year),
					lte(schema.forecastDetails.year, year),
				),
			)
			.groupBy(schema.forecastDetails.categoryId, schema.forecastDetails.forecastType)

		const resultMap = new Map<
			number,
			{ projected: number; executed: number; icon: string; categoryId: number; category: string }
		>()
		test.forEach((item) => {
			if (item.categoryId) {
				const projected =
					test.find((test) => test.categoryId === item.categoryId && test.forecastType === ForecastType.PROJECTED)
						?.amount || 0
				const executed =
					test.find((test) => test.categoryId === item.categoryId && test.forecastType === ForecastType.EXECUTED)
						?.amount || 0
				resultMap.set(item.categoryId, {
					projected: Number(projected),
					executed: Number(executed),
					icon: item.icon ?? '',
					category: item.category ?? '',
					categoryId: item.categoryId,
				})
			}
		})

		return Array.from(resultMap.values())
	}

	const getForecastExecutedAmountByType = async (args: {
		transactionType: TransactionTypeEnum
		startDate: string
		endDate: string
	}) => {
		const forecastAmount = await db
			.select({
				amount: sum(schema.forecastDetails.amount),
			})
			.from(schema.forecastDetails)
			.where(
				and(
					eq(schema.forecastDetails.forecastType, ForecastType.EXECUTED),
					eq(schema.forecastDetails.transactionType, args.transactionType),
					gte(schema.forecastDetails.month, moment(args.startDate).month() + 1),
					lte(schema.forecastDetails.month, moment(args.endDate).month() + 1),
					gte(schema.forecastDetails.year, moment(args.startDate).year()),
					lte(schema.forecastDetails.year, moment(args.endDate).year()),
				),
			)

		return Number(forecastAmount[0].amount || 0)
	}

	const getforecastDetailByCategory = async (): Promise<void> => {
		const forecastDetail = await db
			.select({
				id: schema.categories.id,
				priorityId: schema.forecastDetails.id,
				transactionType: schema.categories.categoryType,
				forecastDetailId: schema.forecastDetails.id,
				category: schema.categories,
				month: schema.forecastDetails.month,
				amount: schema.forecastDetails.amount,
			})
			.from(schema.forecastDetails)
			.where(and(eq(schema.forecastDetails.forecastType, type), eq(schema.forecastDetails.year, year)))
			.leftJoin(schema.categories, eq(schema.forecastDetails.categoryId, schema.categories.id))
			.orderBy(schema.forecastDetails.categoryId)

		const groupedByCategory: Record<string, any[]> = {}
		forecastDetail.forEach((detail) => {
			const key = `${detail.id}`
			if (!groupedByCategory[key]) {
				groupedByCategory[key] = []
			}
			groupedByCategory[key].push(detail)
		})

		const result: ForecastDetailElement[] = Object.values(groupedByCategory).map((details) => {
			const monthsValues: MonthValues = {}
			details.forEach((detail) => {
				if (detail.month !== null && detail.amount !== null) {
					monthsValues[detail.month.toString()] = detail.amount
				}
			})

			return {
				id: details[0].id as number,
				priorityId: details[0].priorityId as number,
				transactionType: details[0].transactionType as TransactionTypeEnum,
				forecastDetailId: details[0].forecastDetailId as number,
				category: details[0].category || undefined,
				monthsValues,
			}
		})

		useForecastsStore.setState({
			forecastsDetailElement: result,
			refreshForecasts: false,
		})
	}

	const getIncomeByForecastTypeAndTransactionType = async (args: { forecastType: ForecastType }) => {
		const forecastDetail = await db
			.select({
				amount: sum(schema.forecastDetails.amount),
				transactionType: schema.forecastDetails.transactionType,
				month: schema.forecastDetails.month,
			})
			.from(schema.forecastDetails)
			.where(and(eq(schema.forecastDetails.forecastType, args.forecastType), eq(schema.forecastDetails.year, year)))
			.groupBy(schema.forecastDetails.transactionType, schema.forecastDetails.month)

		return forecastDetail
	}

	return {
		getForecasts,
		getForecastDetail,
		getForecastComparison,
		saveForecastDetailProjected,
		saveForecastDetailExecuted,
		getAllocationPercentageByPriority,
		getProjectedVsExecutedByCategoryAndType,
		getForecastExecutedAmountByType,
		getforecastDetailByCategory,
		getIncomeByForecastTypeAndTransactionType,
	}
}
