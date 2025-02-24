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
};

export const useForecastStore = create<ForecastStoreType>()((set) => ({
  yearForecast: undefined,
  forecastsDetail: [],
}));
