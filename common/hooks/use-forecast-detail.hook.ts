import * as schema from "@/database/schema";
import { ForecastDetail } from "@/database/schema";
import { useForecastStore } from "@/stores/forecast.store";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useCallback, useState } from "react";
import { ForecastType } from "../enums/forecast.enum";
const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);

export type MonthValues = {
  [key: string]: number;
};

export function useForecastDetail() {
  const { forecastDetailModal, yearForecast } = useForecastStore();
  const [forecastDetail, setForecastDetail] = useState<ForecastDetail[]>([]);

  const getForecastDetail = useCallback(async () => {
    let detail: ForecastDetail[] = [];

    if (forecastDetailModal.priority && forecastDetailModal.category) {
      detail = await db
        .select()
        .from(schema.forecastDetail)
        .where(
          and(
            eq(
              schema.forecastDetail.priorityId,
              forecastDetailModal.priority.id
            ),
            eq(
              schema.forecastDetail.categoryId,
              forecastDetailModal.category.id
            ),
            eq(schema.forecastDetail.forecastType, ForecastType.PROJECTED)
          )
        );
    } else if (forecastDetailModal.account) {
      detail = await db
        .select()
        .from(schema.forecastDetail)
        .where(
          and(
            eq(schema.forecastDetail.accountId, forecastDetailModal.account.id),
            eq(schema.forecastDetail.forecastType, ForecastType.PROJECTED)
          )
        );
    }
    setForecastDetail(detail);
  }, [forecastDetailModal]);

  const saveForecasts = useCallback(
    async (data: MonthValues) => {
      if (forecastDetailModal?.priority && forecastDetailModal?.category) {
        for (const key of Object.keys(data)) {
          const monthIndex = parseInt(key);
          const monthNumber = monthIndex;

          await db
            .insert(schema.forecastDetail)
            .values({
              month: monthNumber,
              amount: data[key],
              priorityId: forecastDetailModal?.priority?.id,
              categoryId: forecastDetailModal?.category?.id,
              forecastType: ForecastType.PROJECTED,
              forecastId: yearForecast?.id,
              id: forecastDetail.find((fd) => fd.month === monthNumber)?.id,
            })
            .onConflictDoUpdate({
              target: [schema.forecastDetail.id],
              set: { amount: data[key] },
            });
        }
      } else if (forecastDetailModal?.account) {
        for (const key of Object.keys(data)) {
          const monthIndex = parseInt(key);
          const monthNumber = monthIndex;

          await db
            .insert(schema.forecastDetail)
            .values({
              month: monthNumber,
              amount: data[key],
              accountId: forecastDetailModal?.account?.id,
              forecastType: ForecastType.PROJECTED,
              forecastId: yearForecast?.id,
              id: forecastDetail.find((fd) => fd.month === monthNumber)?.id,
            })
            .onConflictDoUpdate({
              target: [schema.forecastDetail.id],
              set: { amount: data[key] },
            });
        }
      }

      useForecastStore.setState({
        syncForecastDetail: true,
        forecastDetailModal: {
          priority: undefined,
          category: undefined,
          account: undefined,
          month: undefined,
        },
      });
    },
    [forecastDetailModal, yearForecast, forecastDetail]
  );

  return {
    forecastDetail,
    getForecastDetail,
    saveForecasts,
    db,
  };
}
