import { useForecastData } from "@/common/hooks/use-forecast-data-forecast.hook";
import { useStoreData } from "@/common/hooks/use-store-data.hook";
import { ForecastElement } from "@/components/organisms/forecast/forecast-element.organism";
import { useAccountsStore } from "@/stores/accounts.store";
import { usePrioritiesStore } from "@/stores/priorities.store";
import React, { useEffect } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ForecastWizzardView() {
  const insets = useSafeAreaInsets();
  const { priorities } = usePrioritiesStore();
  const { accounts } = useAccountsStore();
  const { getYearForecasts } = useForecastData();
  const { getAccounts, getPriorities } = useStoreData();

  useEffect(() => {
    getYearForecasts();
    getAccounts();
    getPriorities();
  }, [getYearForecasts, getAccounts, getPriorities]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <PagerView initialPage={0} style={{ flex: 1 }}>
        <ForecastElement accounts={accounts} />
        {priorities.map((priority) => (
          <ForecastElement key={priority.id} priority={priority} />
        ))}
      </PagerView>
    </View>
  );
}
