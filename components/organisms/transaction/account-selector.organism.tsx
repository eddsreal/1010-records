import { TransactionFormValues } from "@/app/(tabs)/new-transaction";
import { useCurrency } from "@/common/hooks/utilities/use-currency.hook";
import { useAccountsStore } from "@/stores/accounts.store";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Text, View } from "react-native";
import { Picker } from "react-native-ui-lib";


export const AccountSelector: React.FC= () => {
  const { accounts } = useAccountsStore();
  const { formatToCurrency } = useCurrency();
  const { control } = useFormContext<TransactionFormValues>()

  return (
    <View className="flex-col mb-4">
      <Text className="text-primary text-lg font-bold">Cuentas</Text>
      <View className="items-center">
        <Controller
          control={control}
          name="account"
          render={({ field: { onChange, onBlur, value } }) => (
            <Picker
              value={value}
              placeholder={"Selecciona una cuenta"}
              onChange={(itemValue) => onChange(itemValue)}
              showSearch
              searchPlaceholder={"Buscar cuenta"}
              renderInput={(value: number | undefined) => {
                const account = accounts.find(
                  (account) => account.id === value,
                );
                return (
                  <View className="flex-row items-center gap-2 border border-gray-200 rounded-xl px-8 py-2">
                    {!value ? (
                      <Text className="text-app-gray text-lg font-bold">
                        Cuenta
                      </Text>
                    ) : (
                      <Text className="text-app-gray text-lg font-bold">
                        {value
                          ? `${account?.name} - ${formatToCurrency(
                              account?.balance || 0,
                            )}`
                          : "Selecciona una cuenta"}
                      </Text>
                    )}
                  </View>
                );
              }}
              searchStyle={{
                color: "black",
                placeholderTextColor: "gray",
              }}
            >
              {accounts.map((account) => (
                <Picker.Item
                  key={account.id}
                  label={account.name}
                  value={account.id}
                />
              ))}
            </Picker>
          )}
        />
      </View>
    </View>
  );
};
