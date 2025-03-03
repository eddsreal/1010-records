import { TransactionFormValues } from "@/common/hooks/use-transaction-form";
import { useAccountsStore } from "@/stores/accounts.store";
import React from "react";
import { Control, Controller } from "react-hook-form";
import { Text, View } from "react-native";
import { Picker } from "react-native-ui-lib";

type Props = {
  control: Control<TransactionFormValues>;
};

export const AccountSelector: React.FC<Props> = ({ control }) => {
  const { accounts } = useAccountsStore();

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
                          ? `${account?.name} - ${account?.balance}`
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
