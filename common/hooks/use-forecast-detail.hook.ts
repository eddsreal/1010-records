import * as schema from "@/database/schema";
import { ForecastDetail } from "@/database/schema";
import { useForecastStore } from "@/stores/forecast.store";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useCallback, useState } from "react";

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
            )
          )
        );
    } else if (forecastDetailModal.account) {
      detail = await db
        .select()
        .from(schema.forecastDetail)
        .where(
          eq(schema.forecastDetail.accountId, forecastDetailModal.account.id)
        );
    }

    setForecastDetail(detail);
  }, [forecastDetailModal]);

  const saveForecasts = useCallback(
    async (data: MonthValues) => {
      if (forecastDetailModal?.priority && forecastDetailModal?.category) {
        Object.keys(data).forEach(async (key) => {
          await db
            .insert(schema.forecastDetail)
            .values({
              month: parseInt(key),
              amount: data[key],
              priorityId: forecastDetailModal?.priority?.id,
              categoryId: forecastDetailModal?.category?.id,
              forecastType: "detail",
              forecastId: yearForecast?.id,
              id: forecastDetail.find((fd) => fd.month === parseInt(key))?.id,
            })
            .onConflictDoUpdate({
              target: [schema.forecastDetail.id],
              set: { amount: data[key] },
            });
        });
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

  const closeModal = useCallback(() => {
    useForecastStore.setState({
      forecastDetailModal: {
        ...forecastDetailModal,
        priority: undefined,
        category: undefined,
        account: undefined,
        month: undefined,
      },
    });
  }, [forecastDetailModal]);

  return {
    forecastDetail,
    getForecastDetail,
    saveForecasts,
    closeModal,
    db,
  };
}
