import { TransactionTypeEnum } from "@/common/enums/transactions.enum";
import * as schema from "@/database/schema";
import { ForecastDetail } from "@/database/schema";
import { useTransactionsStore } from "@/stores/transactions.store";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);

export interface TransactionFormValues {
  amount: number;
  currency: string;
  type: TransactionTypeEnum;
  account: number;
  priority: number;
  category: number;
}

export function useTransactionForm() {
  const { newTransaction } = useTransactionsStore();
  const [forecastDetail, setForecastDetail] = useState<ForecastDetail[]>([]);

  const {
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
    handleSubmit,
  } = useForm<TransactionFormValues>({
    mode: "all",
    defaultValues: {
      type: TransactionTypeEnum.EXPENSE,
      account: undefined,
      priority: undefined,
      category: undefined,
    },
  });

  const type = watch("type");
  const amount = watch("amount");
  const category = watch("category");
  const isIncome = type === TransactionTypeEnum.INCOME;

  const getForecastDetail = useCallback(async () => {
    if (!category || !newTransaction.selectedPriority) return;

    const month = new Date().getMonth() + 1;
    const forecastDetail = await db
      .select()
      .from(schema.forecastDetail)
      .where(
        and(
          eq(
            schema.forecastDetail.priorityId,
            newTransaction.selectedPriority.id
          ),
          eq(schema.forecastDetail.categoryId, category),
          eq(schema.forecastDetail.month, month)
        )
      );

    setForecastDetail(forecastDetail);
  }, [newTransaction.selectedPriority, category]);

  const getForecastInfo = useCallback(() => {
    const proyected = forecastDetail.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    const isMoreThanProyected = amount > proyected;
    const isZero = amount - proyected === 0;

    return {
      proyected,
      isMoreThanProyected,
      isZero,
      difference: proyected - amount,
    };
  }, [forecastDetail, amount]);

  return {
    control,
    errors,
    setValue,
    watch,
    reset,
    handleSubmit,
    isIncome,
    type,
    category,
    amount,
    forecastDetail,
    getForecastDetail,
    getForecastInfo,
  };
}
