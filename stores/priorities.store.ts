import { Category, Priority } from '@/common/hooks/database/schema'
import { create } from 'zustand'

export interface PriorityWithCategories extends Priority {
	categories: Category[]
}

type PrioritiesStoreType = {
	priorities: PriorityWithCategories[]
	refreshPriorities: boolean
	editCategory: Category | null
}

export const usePrioritiesStore = create<PrioritiesStoreType>(() => ({
	priorities: [],
	refreshPriorities: false,
	editCategory: null,
}))
