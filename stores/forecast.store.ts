import { Account, Category, Forecast, ForecastDetail } from "@/database/schema";
import { create } from "zustand";
import { PriorityWithCategories } from "./priorities.store";

export type ForecastDetailPopulated = ForecastDetail & {
  priority?: PriorityWithCategories;
  account?: Account;
  category?: Category;
};

type ForecastStoreType = {
  yearForecast: Forecast | undefined;
  forecastsDetail: ForecastDetailPopulated[];
  syncForecastDetail: boolean;
  forecastDetailModal: {
    open: boolean;
    priority?: PriorityWithCategories;
    category?: Category;
    account?: Account;
    month?: number;
  };
};

export const useForecastStore = create<ForecastStoreType>()((set) => ({
  yearForecast: undefined,
  forecastsDetail: [],
  syncForecastDetail: false,
  forecastDetailModal: {
    open: false,
    priority: undefined,
    category: undefined,
    account: undefined,
    month: undefined,
  },
}));
