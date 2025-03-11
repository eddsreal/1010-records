import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import * as schema from '@/common/hooks/database/schema'
import { Forecast, ForecastDetail } from '@/common/hooks/database/schema'
import { useForecastsStore } from '@/stores/forecasts.store'
import { and, eq, gte, lte, sql, sum } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
import moment from 'moment'
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
		year?: number
	}) => {
		if (args.accountId && !args.month) {
			const forecastDetail = await db
				.select()
				.from(schema.forecastDetails)
				.where(
					and(
						eq(schema.forecastDetails.accountId, args.accountId),
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
					(forecastDetailModal?.priority?.priorityType === TransactionTypeEnum.INCOME
						? TransactionTypeEnum.INCOME
						: TransactionTypeEnum.EXPENSE),
				id: forecastDetail?.find((fd) => fd.month === monthNumber)?.id,
			} as ForecastDetail

			await db
				.insert(schema.forecastDetails)
				.values(innerForecastDetail)
				.onConflictDoUpdate({
					target: [schema.forecastDetails.id],
					set: { amount: data[key], transactionType: innerForecastDetail.transactionType },
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
	}) => {
		let projected = db
			.select({
				amount: sum(schema.forecastDetails.amount),
				accountId: schema.accounts.id,
				account: schema.accounts.name,
				categoryId: schema.categories.id,
				category: schema.categories.name,
				icon: schema.categories.icon,
			})
			.from(schema.forecastDetails)
			.leftJoin(schema.accounts, eq(schema.forecastDetails.accountId, schema.accounts.id))
			.leftJoin(schema.categories, eq(schema.forecastDetails.categoryId, schema.categories.id))
			.where(
				and(
					eq(schema.forecastDetails.forecastType, ForecastType.PROJECTED),
					eq(schema.forecastDetails.transactionType, args.transactionType),
					gte(schema.forecastDetails.month, moment(args.startDate).month() + 1),
					lte(schema.forecastDetails.month, moment(args.endDate).month() + 1),
					gte(schema.forecastDetails.year, moment(args.startDate).year()),
					lte(schema.forecastDetails.year, moment(args.endDate).year()),
				),
			)
			.$dynamic()
			.limit(3)

		let executed = db
			.select({
				amount: sum(schema.forecastDetails.amount),
				accountId: schema.accounts.id,
				account: schema.accounts.name,
				categoryId: schema.categories.id,
				category: schema.categories.name,
				icon: schema.categories.icon ?? schema.priorities.icon,
			})
			.from(schema.forecastDetails)
			.leftJoin(
				schema.accounts,
				and(
					eq(schema.forecastDetails.accountId, schema.accounts.id),
					eq(schema.forecastDetails.transactionType, TransactionTypeEnum.INCOME),
				),
			)
			.leftJoin(schema.categories, eq(schema.forecastDetails.categoryId, schema.categories.id))
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
			.$dynamic()
			.limit(3)

		if (args.transactionType === TransactionTypeEnum.INCOME) {
			projected = projected.groupBy(schema.accounts.id)
			executed = executed.groupBy(schema.accounts.id)
		} else {
			projected = projected.groupBy(schema.forecastDetails.categoryId)
			executed = executed.groupBy(schema.forecastDetails.categoryId)
		}

		return {
			projected: await projected,
			executed: await executed,
		}
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

	return {
		getForecasts,
		getForecastDetail,
		getForecastComparison,
		saveForecastDetailProjected,
		saveForecastDetailExecuted,
		getAllocationPercentageByPriority,
		getProjectedVsExecutedByCategoryAndType,
		getForecastExecutedAmountByType,
	}
}
