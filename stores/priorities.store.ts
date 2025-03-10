import { Category, Priority } from '@/common/hooks/database/schema'
import { create } from 'zustand'

export interface PriorityWithCategories extends Priority {
	categories: Category[]
}

type PrioritiesStoreType = {
	priorities: PriorityWithCategories[]
	refreshPriorities: boolean
}

export const usePrioritiesStore = create<PrioritiesStoreType>(() => ({
	priorities: [],
	refreshPriorities: false,
}))
