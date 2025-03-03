import { TransactionFormTypeEnum } from "@/common/enums/transactions.enum";
import { useTransactionsStore } from "@/stores/transactions.store";
import React from "react";
import { Pressable, Text, View } from "react-native";

export const FormHeader: React.FC = () => {
  const { mode } = useTransactionsStore();
  const isCompleteMode = mode === TransactionFormTypeEnum.COMPLETE;

  const currentMonth = new Date().toLocaleString("es-ES", {
    month: "2-digit",
  });
  const currentYear = new Date().getFullYear();

  return (
    <View className="flex-row justify-between items-center mb-4">
      <Text className="text-app-primary text-lg">
        {currentYear}-{currentMonth}
      </Text>
      <View className="flex-row items-center">
        <Pressable
          className={`py-2 px-4 rounded-l-md ${
            !isCompleteMode ? "bg-primary" : "bg-gray-200"
          }`}
          onPress={() =>
            useTransactionsStore.setState({
              mode: TransactionFormTypeEnum.FAST,
            })
          }
        >
          <Text
            className={`${!isCompleteMode ? "text-white font-bold" : "text-gray-400"} text-lg`}
          >
            Rápido
          </Text>
        </Pressable>
        <Pressable
          className={`py-2 px-4 rounded-r-md ${
            isCompleteMode ? "bg-primary" : "bg-gray-200"
          }`}
          onPress={() =>
            useTransactionsStore.setState({
              mode: TransactionFormTypeEnum.COMPLETE,
            })
          }
        >
          <Text
            className={`${isCompleteMode ? "text-white font-bold" : "text-gray-400"} text-lg`}
          >
            Completo
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
