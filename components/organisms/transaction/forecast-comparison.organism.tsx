import React from "react";
import { Text, View } from "react-native";

type Props = {
  amount: number;
  proyected: number;
  isMoreThanProyected: boolean;
  isZero: boolean;
  difference: number;
};

export const ForecastComparison: React.FC<Props> = ({
  amount,
  proyected,
  isMoreThanProyected,
  isZero,
  difference,
}) => {
  return (
    <View className="mb-4">
      <Text className="text-primary text-lg font-bold">
        Comparación de gastos
      </Text>
      <View className="flex-row gap-4 items-center justify-center p-4">
        <View>
          <Text className="text-app-gray text-lg font-bold">Proyectado</Text>
          <Text className="text-app-gray text-lg font-bold">{proyected}</Text>
        </View>
        <View>
          <Text className="text-app-gray text-lg font-bold">
            Ejecutado + Esta Transacción
          </Text>
          <Text className="text-app-gray text-lg font-bold">{amount}</Text>
        </View>
      </View>
      <View className="flex-row gap-4 items-center justify-center p-4">
        <Text className="text-app-gray text-lg font-bold">
          {isMoreThanProyected && !isZero
            ? `Estás ${difference * -1} por encima de lo proyectado`
            : ""}
          {!isMoreThanProyected && !isZero
            ? `Aún tienes ${difference} presupuestado para este mes`
            : ""}
          {isZero ? "Muy bien! estás sin fugas de dinero" : ""}
        </Text>
      </View>
    </View>
  );
};
