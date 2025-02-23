import { Category, Priority } from "@/database/schema";
import { create } from "zustand";

export interface PriorityWithCategories extends Priority {
  categories: Category[];
}

type PrioritiesStoreType = {
  priorities: PriorityWithCategories[];
};

export const usePrioritiesStore = create<PrioritiesStoreType>(() => ({
  priorities: [],
}));
