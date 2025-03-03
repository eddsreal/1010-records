import { useTransactionsStore } from "@/stores/transactions.store";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  onSave: () => void;
  onReset: () => void;
};

export const ActionButtons: React.FC<Props> = ({ onSave, onReset }) => {
  const { newTransaction } = useTransactionsStore();

  const handleCancel = () => {
    onReset();
    router.back();
    newTransaction.reset?.();
  };

  return (
    <View className="flex-row gap-4 items-center justify-center p-4">
      <Pressable className="py-2 px-4 rounded-md bg-primary" onPress={onSave}>
        <Text className="text-white text-lg font-bold">Guardar</Text>
      </Pressable>
      <Pressable
        className="py-2 px-4 rounded-md bg-secondary"
        onPress={handleCancel}
      >
        <Text className="text-white text-lg font-bold">Cancelar</Text>
      </Pressable>
    </View>
  );
};
