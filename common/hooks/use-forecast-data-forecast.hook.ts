import * as schema from "@/database/schema";
import { Forecast } from "@/database/schema";
import { useForecastStore } from "@/stores/forecast.store";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useCallback } from "react";

const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);

export function useForecastData() {
  const getYearForecasts = useCallback(async () => {
    let resultYearForecast: Forecast[] = await db
      .select()
      .from(schema.forecast)
      .where(eq(schema.forecast.year, new Date().getFullYear()));

    if (!resultYearForecast.length) {
      await db.insert(schema.forecast).values({
        year: new Date().getFullYear(),
      });
      resultYearForecast = await db
        .select()
        .from(schema.forecast)
        .where(eq(schema.forecast.year, new Date().getFullYear()));
    }

    useForecastStore.setState({
      yearForecast: resultYearForecast?.[0],
    });
  }, []);

  return {
    getYearForecasts,
    db,
  };
}
