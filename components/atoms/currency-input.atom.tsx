import { inputStyles } from "@/common/styles/input.styles";
import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { MaskedInput, MaskedInputProps } from "react-native-ui-lib";

interface CurrencyInputProps extends MaskedInputProps {
  prefix?: string;
}

export function CurrencyInputAtom({
  prefix = "$",
  ...props
}: CurrencyInputProps) {
  const [value, setValue] = useState("");

  const renderCurrencyText = useCallback(
    (value: string) => {
      const [integerPart = "", decimalPart = ""] = value.split(".");
      const formattedInteger = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ",",
      );

      if (value === "") {
        return (
          <View style={inputStyles.fieldStyle}>
            <Text className="text-base text-gray-500 text-center">
              {props.placeholder}
            </Text>
          </View>
        );
      }
      return (
        <View style={inputStyles.fieldStyle}>
          <Text className="text-xl text-gray-500 text-center">
            <Text className="text-primary">{prefix}</Text>
            {formattedInteger}
            {decimalPart && (
              <>
                <Text className="text-primary">.</Text>
                {decimalPart}
              </>
            )}
          </Text>
        </View>
      );
    },
    [prefix, props.placeholder],
  );

  const formatter = useCallback((value: string) => {
    let cleaned = value.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = `${parts[0]}.${parts.slice(1).join("")}`;
    }
    if (parts[1]?.length > 2) {
      cleaned = `${parts[0]}.${parts[1].slice(0, 2)}`;
    }

    return cleaned;
  }, []);

  return (
    <MaskedInput
      migrate
      renderMaskedText={renderCurrencyText}
      formatter={formatter}
      keyboardType="numeric"
      maxLength={100}
      initialValue={value}
      onChangeText={setValue}
      placeholder={props.placeholder}
      floatingPlaceholder
      placeholderClassName="text-gray-500"
      containerStyle={props.containerStyle}
      {...props}
    />
  );
}
