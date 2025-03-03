import {
  MonthValues,
  useForecastDetail,
} from "@/common/hooks/use-forecast-detail.hook";
import * as schema from "@/database/schema";
import { useForecastStore } from "@/stores/forecast.store";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, ScrollView, Text, TextInput, View } from "react-native";
const months = Array.from({ length: 12 }).map((_, monthIndex) => {
  return new Date(2024, monthIndex).toLocaleString("es-CO", {
    month: "long",
  });
});
const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);

export default function EditForecastElement() {
  const { forecastDetailModal } = useForecastStore();
  const { forecastDetail, getForecastDetail, saveForecasts } =
    useForecastDetail();

  const { control, handleSubmit, setValue, reset } = useForm<MonthValues>({
    defaultValues: {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
    },
  });

  useEffect(() => {
    getForecastDetail();
  }, [getForecastDetail]);

  useEffect(() => {
    if (forecastDetail.length > 0) {
      reset();

      forecastDetail.forEach((d) => {
        const monthIndex = d.month;
        setValue(monthIndex.toString(), d.amount);
      });
    }
  }, [forecastDetail, setValue, reset]);

  const onSubmit = async (data: MonthValues) => {
    await saveForecasts(data);
    reset();
    router.push("/forecast");
  };

  const handleCancel = () => {
    reset();
    router.push("/forecast");
  };

  return (
    <View className="bg-white p-4">
      <View className="mb-4 h-[10%]">
        {forecastDetailModal.priority && (
          <>
            <Text className="text-3xl font-bold text-primary">
              {forecastDetailModal.priority?.name}
            </Text>
            <Text className="text-2xl font-bold text-app-primary">
              {forecastDetailModal.category?.name}
            </Text>
          </>
        )}
        {forecastDetailModal.account && (
          <>
            <Text className="text-3xl font-bold text-primary">
              {forecastDetailModal.account?.name}
            </Text>
          </>
        )}
      </View>

      <ScrollView className="h-[80%]">
        {months.map((month, monthIndex) => {
          return (
            <View
              key={monthIndex}
              className="p-2 border-gray-200 items-center flex-row"
            >
              <View className="w-1/2 px-4 py-2">
                <Text className="text-lg font-bold text-primary text-right">
                  {month.toUpperCase()}
                </Text>
              </View>
              <View className="w-1/2 px-4 py-2">
                <Controller
                  control={control}
                  name={(monthIndex + 1).toString()}
                  render={({ field }) => (
                    <TextInput
                      className="border-2 border-gray-300 rounded-md p-2"
                      keyboardType="numeric"
                      value={field?.value?.toString()}
                      onChangeText={(text) => {
                        field.onChange(Number(text));
                      }}
                    />
                  )}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View className="flex-row justify-end mt-4 space-x-2 h-[10%]">
        <Button title="Guardar" onPress={handleSubmit(onSubmit)} />
        <Button
          title="db reset"
          onPress={() =>
            db.delete(schema.forecastDetail).then(() => console.log("deleted"))
          }
        />
        <Button title="Cancelar" onPress={handleCancel} color="gray" />
      </View>
    </View>
  );
}
