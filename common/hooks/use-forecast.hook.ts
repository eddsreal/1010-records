import { ForecastType } from "@/common/enums/forecast.enum";
import * as schema from "@/database/schema";
import { useTransactionsStore } from "@/stores/transactions.store";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);

export function useForecast() {
  const { year, month } = useTransactionsStore();

  const upsertForecastDetail = async (data: Partial<schema.Transaction>) => {
    if (data.priorityId && data.categoryId) {
      const forecast = await db
        .select()
        .from(schema.forecast)
        .where(eq(schema.forecast.year, parseInt(year)));

      const forecastDetail = await db
        .select()
        .from(schema.forecastDetail)
        .where(
          and(
            eq(schema.forecastDetail.forecastId, forecast[0].id),
            eq(schema.forecastDetail.month, parseInt(month)),
            eq(schema.forecastDetail.priorityId, data.priorityId),
            eq(schema.forecastDetail.categoryId, data.categoryId),
            eq(schema.forecastDetail.forecastType, ForecastType.EXECUTED)
          )
        );

      if (forecastDetail.length > 0 && data.amount) {
        await db
          .update(schema.forecastDetail)
          .set({ amount: forecastDetail[0].amount + data.amount })
          .where(eq(schema.forecastDetail.id, forecastDetail[0].id));
      }

      if (forecastDetail.length === 0) {
        if (data.amount && data.priorityId && data.categoryId) {
          await db.insert(schema.forecastDetail).values({
            forecastId: forecast[0].id,
            month: parseInt(month),
            priorityId: data.priorityId,
            categoryId: data.categoryId,
            amount: data.amount,
            forecastType: ForecastType.EXECUTED,
          });
        }
      }
    }
  };

  return {
    upsertForecastDetail,
  };
}
