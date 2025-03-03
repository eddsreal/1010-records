import { TransactionFormTypeEnum } from "@/common/enums/transactions.enum";
import {
  TransactionFormValues,
  useTransactionForm,
} from "@/common/hooks/use-transaction-form";
import { AccountSelector } from "@/components/organisms/transaction/account-selector.organism";
import { ActionButtons } from "@/components/organisms/transaction/action-buttons.organism";
import { AmountInput } from "@/components/organisms/transaction/amount-input.organism";
import { ForecastComparison } from "@/components/organisms/transaction/forecast-comparison.organism";
import { FormHeader } from "@/components/organisms/transaction/form-header.organism";
import { MovementTypeSelector } from "@/components/organisms/transaction/movement-type-selector.organism";
import { PrioritySelector } from "@/components/organisms/transaction/priority-selector.organism";
import { useTransactionsStore } from "@/stores/transactions.store";
import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";

export default function NewTransactionView() {
  const { mode } = useTransactionsStore();
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

  const onSubmit = (data: TransactionFormValues) => {
    console.log("Guardando transacción:", data);
  };

  return (
    <ScrollView className="p-4 bg-white">
      <Text className="text-primary text-5xl font-bold mb-4">
        Registro de transacción
      </Text>

      <FormHeader />

      <View>
        <MovementTypeSelector isIncome={isIncome} setValue={setValue} />
        <AmountInput control={control} />

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
