export interface Priority {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  suggestedCategories?: Category[];
  categories: Category[];
}

export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  priorityId?: number;
}
