import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import * as schema from '@/common/hooks/database/schema'
import { Category, Priority } from '@/common/hooks/database/schema'
import { PriorityWithCategories, usePrioritiesStore } from '@/stores/priorities.store'
import { and, eq, like } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
import { useEffect } from 'react'

const expoDb = openDatabaseSync('1010records')
const db = drizzle(expoDb)

interface PrioritiesFilter {
	isDeleted?: boolean
}

export function usePriorities() {
	const { priorities, refreshPriorities } = usePrioritiesStore()

	useEffect(() => {
		getPriorities()
	}, [refreshPriorities])

	const getPriorities = async (filter?: PrioritiesFilter) => {
		const priorities = await db
			.select()
			.from(schema.priorities)
			.leftJoin(schema.categories, eq(schema.categories.priorityId, schema.priorities.id))
			.where(filter?.isDeleted ? eq(schema.priorities.isDeleted, filter.isDeleted) : undefined)
			.orderBy(schema.categories.name)
			.then((results) => {
				const grouped = results.reduce(
					(acc, row) => {
						if (!acc[row.priorities.id]) {
							acc[row.priorities.id] = {
								...row.priorities,
								categories: [],
							}
						}
						if (row.categories) {
							acc[row.priorities.id].categories.push(row.categories)
						}
						return acc
					},
					{} as Record<number, PriorityWithCategories>,
				)

				return Object.values(grouped)
			})
		usePrioritiesStore.setState({ priorities, refreshPriorities: false })
	}

	const createPriority = async (priority: Priority) => {
		await db.insert(schema.priorities).values(priority)
		usePrioritiesStore.setState({ refreshPriorities: true })
	}

	const updatePriority = async (priority: Priority) => {
		await db.update(schema.priorities).set(priority).where(eq(schema.priorities.id, priority.id))
		usePrioritiesStore.setState({ refreshPriorities: true })
	}

	const deletePriority = async (priority: Priority) => {
		await updatePriority({
			...priority,
			isDeleted: true,
		})
		usePrioritiesStore.setState({ refreshPriorities: true })
	}

	const createCategory = async (category: Category) => {
		await db
			.insert(schema.categories)
			.values(category)
			.onConflictDoUpdate({
				target: [schema.categories.id],
				set: {
					name: category.name,
					description: category.description,
					icon: category.icon,
				},
			})
		usePrioritiesStore.setState({ refreshPriorities: true })
	}

	const updateCategory = async (category: Category) => {
		await db.update(schema.categories).set(category).where(eq(schema.categories.id, category.id))
		usePrioritiesStore.setState({ refreshPriorities: true })
	}

	const deleteCategory = async (category: Category) => {
		await db.update(schema.categories).set({ isDeleted: true }).where(eq(schema.categories.id, category.id))
		usePrioritiesStore.setState({ refreshPriorities: true })
	}

	const getCagetoriesByQueryAndType = async (query: string, type: TransactionTypeEnum) => {
		const categoriesQuery = db
			.select({
				id: schema.categories.id,
				name: schema.categories.name,
				icon: schema.categories.icon,
				color: schema.priorities.color,
				priorityId: schema.categories.priorityId,
			})
			.from(schema.categories)
			.leftJoin(schema.priorities, eq(schema.categories.priorityId, schema.priorities.id))
			.orderBy(schema.priorities.id, schema.categories.name)
			.$dynamic()

		if (query !== '') {
			categoriesQuery.where(
				and(
					like(schema.categories.name, `%${query}%`),
					eq(schema.priorities.priorityType, type),
					eq(schema.categories.isDeleted, false),
				),
			)
		} else {
			categoriesQuery.where(and(eq(schema.priorities.priorityType, type), eq(schema.categories.isDeleted, false)))
		}

		return await categoriesQuery
	}

	return {
		priorities,
		createPriority,
		updatePriority,
		deletePriority,
		createCategory,
		updateCategory,
		deleteCategory,
		getCagetoriesByQueryAndType,
		getPriorities,
	}
}
