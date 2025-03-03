import * as schema from "@/database/schema";
import { Account, Category, Forecast, ForecastDetail } from "@/database/schema";
import { useAccountsStore } from "@/stores/accounts.store";
import { useForecastStore } from "@/stores/forecast.store";
import {
  PriorityWithCategories,
  usePrioritiesStore,
} from "@/stores/priorities.store";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Modal, ScrollView, Text, TextInput, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);
const months = Array.from({ length: 12 }).map((_, monthIndex) => {
  return new Date(2024, monthIndex).toLocaleString("es-CO", {
    month: "long",
  });
});

export const ForecastPriorityElement: React.FunctionComponent<{
  priority: PriorityWithCategories;
}> = ({ priority }) => {
  const { syncForecastDetail } = useForecastStore();
  const [forecastDetail, setForecastDetail] = useState<ForecastDetail[]>([]);

  const getForecastDetail = useCallback(async () => {
    const forecastDetail = await db
      .select()
      .from(schema.forecastDetail)
      .where(eq(schema.forecastDetail.priorityId, priority.id));
    setForecastDetail(forecastDetail);

    useForecastStore.setState({
      syncForecastDetail: false,
    });
  }, [priority?.id]);

  useEffect(() => {
    getForecastDetail();
  }, [getForecastDetail, syncForecastDetail]);

  return (
    <View>
      <Text className="text-3xl font-bold text-primary">{priority.name}</Text>

      <View className="mt-4">
        {priority.categories?.map((category: Category) => (
          <View key={category.id} className="flex-row items-center mb-4">
            <View className="w-4/12">
              <Text className="text-gray-500 text-lg font-bold">
                {category.icon} {category.name}
              </Text>
            </View>
            <View className="w-8/12">
              <ScrollView horizontal>
                {months.map((month, monthIndex) => {
                  const monthData = forecastDetail.find(
                    (fd) =>
                      fd.month === monthIndex + 1 &&
                      fd.categoryId === category.id &&
                      fd.priorityId === priority.id,
                  );
                  const amount = monthData?.amount || 0;

                  return (
                    <View
                      key={monthIndex}
                      className="w-40 p-2 border-r border-gray-200 items-center"
                    >
                      <Text className="text-sm font-bold text-primary">
                        {month}
                      </Text>
                      <Text
                        className="text-lg mt-1 text-gray-500"
                        onPress={() => {
                          useForecastStore.setState({
                            forecastDetailModal: {
                              open: true,
                              priority,
                              category,
                            },
                          });
                        }}
                      >
                        $
                        {amount.toLocaleString("es-CO", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export const ForecastAccountElement: React.FunctionComponent<{
  account: Account;
}> = ({ account }) => {
  const [forecastDetail, setForecastDetail] = useState<ForecastDetail[]>([]);

  const getForecastDetail = useCallback(async () => {
    const detail = await db
      .select()
      .from(schema.forecastDetail)
      .where(eq(schema.forecastDetail.accountId, account.id));
    setForecastDetail(detail);
  }, [account.id]);

  useEffect(() => {
    getForecastDetail();
  }, [getForecastDetail]);

  return (
    <View className="flex-row items-center">
      <View className="w-4/12">
        <Text className="text-lg font-bold text-gray-500">{account.name}</Text>
      </View>

      <ScrollView horizontal className="w-8/12">
        {Array.from({ length: 12 }).map((_, monthIndex) => {
          const monthData = forecastDetail.find(
            (fd) => fd.month === monthIndex + 1 && fd.accountId === account.id,
          );
          const amount = monthData?.amount || 0;

          return (
            <View
              key={monthIndex}
              className="w-32 p-2 border-r border-gray-200 items-center"
            >
              <Text className="text-sm font-bold text-primary">
                {new Date(2024, monthIndex).toLocaleString("es-CO", {
                  month: "long",
                })}
              </Text>
              <Text
                className="text-lg mt-1 text-gray-500"
                onPress={() => {
                  useForecastStore.setState({
                    forecastDetailModal: {
                      open: true,
                      account,
                    },
                  });
                }}
              >
                $
                {amount.toLocaleString("es-CO", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export const ForecastElement: React.FunctionComponent<{
  priority?: PriorityWithCategories;
  accounts?: Account[];
}> = ({ priority, accounts }) => {
  return (
    <View className="p-4">
      {priority && <ForecastPriorityElement priority={priority} />}
      {accounts && (
        <View>
          <Text className="text-3xl font-bold text-primary">Cuentas</Text>
          {accounts.map((account) => (
            <ForecastAccountElement key={account.id} account={account} />
          ))}
        </View>
      )}
    </View>
  );
};

export const AddForecastDetailModal: React.FunctionComponent = () => {
  const { forecastDetailModal, yearForecast } = useForecastStore();
  const [forecastDetail, setForecastDetail] = useState<ForecastDetail[]>([]);

  type MonthValues = {
    [key: string]: number;
  };

  const { control, handleSubmit, setValue, reset } = useForm<MonthValues>({
    defaultValues: {
      "0": 0,
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
    },
  });

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
              forecastDetailModal.priority.id,
            ),
            eq(
              schema.forecastDetail.categoryId,
              forecastDetailModal.category.id,
            ),
          ),
        );
    } else if (forecastDetailModal.account) {
      detail = await db
        .select()
        .from(schema.forecastDetail)
        .where(
          eq(schema.forecastDetail.accountId, forecastDetailModal.account.id),
        );
    }
    setForecastDetail(detail);
  }, [forecastDetailModal]);

  useEffect(() => {
    forecastDetail.forEach((d) => {
      setValue(d.month.toString(), d.amount);
    });
  }, [forecastDetail, setValue]);

  const onSubmit = async (data: MonthValues) => {
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
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }
    useForecastStore.setState({
      syncForecastDetail: true,
      forecastDetailModal: {
        open: false,
        priority: undefined,
        category: undefined,
        account: undefined,
        month: undefined,
      },
    });
  };

  useEffect(() => {
    getForecastDetail();
  }, [getForecastDetail]);

  return (
    <Modal
      visible={forecastDetailModal.open}
      onRequestClose={() => {
        useForecastStore.setState({
          forecastDetailModal: {
            ...forecastDetailModal,
            open: false,
          },
        });
      }}
    >
      <View className="mt-20 bg-white">
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
        <Text>{forecastDetailModal.month}</Text>

        <ScrollView>
          {months.map((month, monthIndex) => {
            return (
              <View
                key={monthIndex}
                className="p-2 border-gray-200 items-center flex-row"
              >
                <View className="w-1/2 px-4 py-2  ">
                  <Text className="text-lg font-bold text-primary text-right">
                    {month.toUpperCase()}
                  </Text>
                </View>
                <View className="w-1/2 px-4 py-2">
                  <Controller
                    control={control}
                    name={monthIndex.toString()}
                    render={({ field }) => (
                      <TextInput
                        {...field}
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

        <View className="flex-row justify-end">
          <Button title="Guardar" onPress={handleSubmit(onSubmit)} />
          <Button
            title="Cancelar"
            onPress={() => {
              useForecastStore.setState({
                forecastDetailModal: {
                  ...forecastDetailModal,
                  open: false,
                  priority: undefined,
                  category: undefined,
                  account: undefined,
                  month: undefined,
                },
              });
              reset();
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default function ForecastWizzardView() {
  const insets = useSafeAreaInsets();
  const { priorities } = usePrioritiesStore();
  const { accounts } = useAccountsStore();

  const getYearForecasts = async () => {
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
  };

  const getAccounts = async () => {
    const accounts = await db.select().from(schema.accounts);
    useAccountsStore.setState({ accounts });
  };

  const getPriorities = async () => {
    const prioritiesWithCategories = await db
      .select()
      .from(schema.priorities)
      .leftJoin(
        schema.categories,
        eq(schema.categories.priorityId, schema.priorities.id),
      )
      .then((results) => {
        const grouped = results.reduce(
          (acc, row) => {
            if (!acc[row.priorities.id]) {
              acc[row.priorities.id] = {
                ...row.priorities,
                categories: [],
              };
            }
            if (row.categories) {
              acc[row.priorities.id].categories.push(row.categories);
            }
            return acc;
          },
          {} as Record<number, PriorityWithCategories>,
        );

        return Object.values(grouped);
      });

    usePrioritiesStore.setState({ priorities: prioritiesWithCategories });
  };

  useEffect(() => {
    getYearForecasts();
    getAccounts();
    getPriorities();
  }, []);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <PagerView initialPage={0} style={{ flex: 1 }}>
        <ForecastElement accounts={accounts} />
        {priorities.map((priority) => (
          <ForecastElement key={priority.id} priority={priority} />
        ))}
      </PagerView>
      <AddForecastDetailModal />
    </View>
  );
}
