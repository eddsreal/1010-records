import { TransactionFormValues } from "@/common/hooks/use-transaction-form";
import { inputStyles } from "@/common/styles/input.styles";
import { CurrencyInputAtom } from "@/components/atoms/currency-input.atom";
import React from "react";
import { Control, Controller } from "react-hook-form";
import { Text, View } from "react-native";
import { TextField } from "react-native-ui-lib";

type Props = {
  control: Control<TransactionFormValues>;
};

export const AmountInput: React.FC<Props> = ({ control }) => {
  return (
    <View className="mb-4">
      <Text className="text-primary text-lg font-bold">Monto</Text>
      <View className="flex-row gap-4 items-center p-4">
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <CurrencyInputAtom
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={"Monto"}
              placeholderClassName="text-gray-500"
              containerStyle={{
                ...inputStyles.containerStyle,
                width: "80%",
              }}
            />
          )}
          name="amount"
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              placeholder="Moneda"
              onBlur={onBlur}
              onChangeText={onChange}
              inputMode="decimal"
              value={value}
              fieldStyle={inputStyles.fieldStyle}
              containerStyle={{
                ...inputStyles.containerStyle,
                width: "20%",
              }}
            />
          )}
          name="currency"
        />
      </View>
    </View>
  );
};
