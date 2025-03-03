import {
  TransactionFormTypeEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from "@/common/enums/transactions.enum";
import {
  TransactionFormValues,
  useTransactionForm,
} from "@/common/hooks/use-transaction-form";
import { inputStyles } from "@/common/styles/input.styles";
import { CurrencyMaskedInput } from "@/components/atoms/currency-masked-input.atom";
import { AccountSelector } from "@/components/organisms/transaction/account-selector.organism";
import { ActionButtons } from "@/components/organisms/transaction/action-buttons.organism";
import { ForecastComparison } from "@/components/organisms/transaction/forecast-comparison.organism";
import { FormHeader } from "@/components/organisms/transaction/form-header.organism";
import { MovementTypeSelector } from "@/components/organisms/transaction/movement-type-selector.organism";
import { PrioritySelector } from "@/components/organisms/transaction/priority-selector.organism";
import * as schema from "@/database/schema";
import { usePrioritiesStore } from "@/stores/priorities.store";
import { useTransactionsStore } from "@/stores/transactions.store";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";
import { useCallback, useEffect } from "react";
import { Controller } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);

export default function NewTransactionView() {
  const { mode, editTransaction, newTransaction } = useTransactionsStore();
  const { priorities } = usePrioritiesStore();
  const {
    control,
    setValue,
    reset,
    handleSubmit,
    isIncome,
    category,
    amount,
    getForecastDetail,
    getForecastInfo,
  } = useTransactionForm();

  const isCompleteMode = mode === TransactionFormTypeEnum.COMPLETE;

  useEffect(() => {
    if (category) {
      getForecastDetail();
    }
  }, [category, getForecastDetail]);

  const setTransactionValues = useCallback(() => {
    if (editTransaction) {
      useTransactionsStore.setState({
        mode: TransactionFormTypeEnum.COMPLETE,
      });
      setValue("amount", editTransaction.amount);
      setValue("type", editTransaction.type as TransactionTypeEnum);

      if (editTransaction.accountId) {
        setValue("account", editTransaction.accountId);
      }

      if (editTransaction.categoryId) {
        setValue("category", editTransaction.categoryId);
      }
    }
  }, [editTransaction, setValue]);

  useEffect(() => {
    if (editTransaction) {
      setTransactionValues();
    }
  }, [editTransaction, setTransactionValues]);

  const onSubmit = async (data: TransactionFormValues) => {
    if (!isCompleteMode) {
      await db.insert(schema.transaction).values({
        amount: data.amount,
        type: data.type,
        status: TransactionStatusEnum.PENDING,
      });
    }
    if (isCompleteMode && editTransaction) {
      const dataToUpdate: Partial<schema.Transaction> = {
        amount: data.amount,
        type: data.type,
        status: TransactionStatusEnum.PENDING,
      };

      if (data.account) {
        dataToUpdate.accountId = data.account;
      }

      if (newTransaction.selectedPriority?.id) {
        dataToUpdate.priorityId = newTransaction.selectedPriority?.id;
      }

      if (data.category) {
        dataToUpdate.categoryId = data.category;
      }

      if (
        (data.amount &&
          data.category &&
          newTransaction.selectedPriority?.id &&
          data.account &&
          data.type === TransactionTypeEnum.EXPENSE) ||
        (data.amount &&
          data.account &&
          data.type === TransactionTypeEnum.INCOME)
      ) {
        dataToUpdate.status = TransactionStatusEnum.COMPLETED;
      }

      console.log(dataToUpdate);

      await db
        .update(schema.transaction)
        .set(dataToUpdate)
        .where(eq(schema.transaction.id, editTransaction?.id as number));
    }

    router.back();
  };

  return (
    <ScrollView className="p-4 bg-white">
      <Text className="text-primary text-5xl font-bold mb-4">
        Registro de transacción
      </Text>

      <FormHeader />

      <View>
        <MovementTypeSelector isIncome={isIncome} setValue={setValue} />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <CurrencyMaskedInput
              label={"Monto"}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value?.toString()}
              placeholder={"Ingrese un monto"}
              style={{
                ...inputStyles.fieldStyle,
              }}
            />
          )}
          name="amount"
        />

        {isCompleteMode && <AccountSelector control={control} />}

        {isCompleteMode && !isIncome && <PrioritySelector control={control} />}

        {isCompleteMode && !isIncome && category && amount > 0 && (
          <ForecastComparison amount={amount} {...getForecastInfo()} />
        )}

        <ActionButtons onSave={handleSubmit(onSubmit)} onReset={reset} />
      </View>
    </ScrollView>
  );
}
