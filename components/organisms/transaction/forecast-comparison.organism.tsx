import { useCurrency } from "@/common/hooks/utilities/use-currency.hook";
import { ForecastDetail } from "@/database/schema";
import React from "react";
import { Text, View } from "react-native";

type Props = {
  amount: number;
  proyected: number;
  isMoreThanProyected: boolean;
  isZero: boolean;
  difference: number;
  executedForecast?: ForecastDetail;
};

export const ForecastComparison: React.FC<Props> = ({
  amount,
  proyected,
  isMoreThanProyected,
  isZero,
  difference,
  executedForecast,
}) => {
  const { formatToCurrency } = useCurrency();

  return (
    <View className="mb-4">
      <Text className="text-primary text-lg font-bold">
        Comparación de gastos
      </Text>
      <View className="flex-row gap-4 items-center justify-center p-4">
        <View>
          <Text className="text-app-gray text-lg font-bold">Proyectado</Text>
          <Text className="text-app-gray text-lg font-bold">
            {formatToCurrency(proyected)}
          </Text>
        </View>
        <View>
          <Text className="text-app-gray text-lg font-bold">
            Ejecutado + Esta Transacción
          </Text>
          <Text className="text-app-gray text-lg font-bold">
            {executedForecast
              ? formatToCurrency(
                  Number(executedForecast.amount) + Number(amount),
                )
              : formatToCurrency(amount)}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-4 items-center justify-center p-4">
        <Text className="text-app-gray text-lg font-bold">
          {isMoreThanProyected && !isZero
            ? `Estás ${formatToCurrency(difference * -1)} por encima de lo proyectado`
            : ""}
          {!isMoreThanProyected && !isZero
            ? `Aún tienes ${formatToCurrency(difference)} presupuestado para este mes`
            : ""}
          {isZero ? "Muy bien! estás sin fugas de dinero" : ""}
        </Text>
      </View>
    </View>
  );
};
