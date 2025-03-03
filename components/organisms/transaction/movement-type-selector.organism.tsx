import { TransactionTypeEnum } from "@/common/enums/transactions.enum";
import { TransactionFormValues } from "@/common/hooks/use-transaction-form";
import React from "react";
import { UseFormSetValue } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

type Props = {
  isIncome: boolean;
  setValue: UseFormSetValue<TransactionFormValues>;
};

export const MovementTypeSelector: React.FC<Props> = ({
  isIncome,
  setValue,
}) => {
  return (
    <View className="mb-4">
      <Text className="text-primary text-lg font-bold">
        Tipo de transacción
      </Text>
      <View className="flex-row gap-4 items-center justify-center p-4">
        <Pressable
          className={`py-2 px-4 rounded-md ${
            isIncome ? "bg-primary" : "bg-gray-200"
          }`}
          onPress={() => setValue("type", TransactionTypeEnum.INCOME)}
        >
          <Text
            className={`${isIncome ? "text-white" : "text-gray-400"} text-lg font-bold`}
          >
            Ingreso
          </Text>
        </Pressable>
        <Pressable
          className={`py-2 px-4 rounded-md ${
            !isIncome ? "bg-secondary" : "bg-gray-200"
          }`}
          onPress={() => setValue("type", TransactionTypeEnum.EXPENSE)}
        >
          <Text
            className={`${!isIncome ? "text-white" : "text-gray-400"} text-lg font-bold`}
          >
            Gasto
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
