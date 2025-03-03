import { Account } from "@/database/schema";
import { PriorityWithCategories } from "@/stores/priorities.store";
import React from "react";
import { Text, View } from "react-native";
import { ForecastAccountElement } from "./forecast-account-element.organism";
import { ForecastPriorityElement } from "./forecast-priority-element.organism";

type Props = {
  priority?: PriorityWithCategories;
  accounts?: Account[];
};

export const ForecastElement: React.FC<Props> = ({ priority, accounts }) => {
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
