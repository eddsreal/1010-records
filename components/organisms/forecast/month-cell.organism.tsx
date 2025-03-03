import React from "react";
import { Text, View } from "react-native";

type Props = {
  monthName: string;
  amount: number;
  onPress: () => void;
};

export const MonthCell: React.FC<Props> = ({ monthName, amount, onPress }) => {
  return (
    <View className="p-2 border-r border-gray-200 items-center w-40">
      <Text className="text-sm font-bold text-primary">{monthName}</Text>
      <Text className="text-lg mt-1 text-gray-500" onPress={onPress}>
        $
        {amount.toLocaleString("es-CO", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
    </View>
  );
};
