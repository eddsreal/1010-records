import { useCurrency } from "@/common/hooks/utilities/use-currency.hook";
import React, { useCallback } from "react";
import { Text, ViewStyle } from "react-native";
import { MaskedInput } from "react-native-ui-lib";

interface Props {
  value: string | undefined;
  placeholder?: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  style?: ViewStyle;
  maxLength?: number;
  label?: string;
}

export const CurrencyMaskedInput: React.FC<Props> = ({
  value,
  placeholder,
  onChangeText,
  onBlur,
  style,
  maxLength = 15,
  label,
}) => {
  const { formatToCurrency, parseCurrencyToNumber } = useCurrency();

  const formatter = useCallback((text: string | undefined) => {
    if (!text) return "";
    return text.replace(/[^0-9]/g, "");
  }, []);

  const renderMaskedText = useCallback(
    (value: string | undefined) => {
      if (!value) {
        return (
          <Text className={"text-gray-500 text-xl font-bold"}>
            {placeholder}
          </Text>
        );
      }

      const numericValue = parseCurrencyToNumber(value);
      const formattedValue = formatToCurrency(numericValue);

      return (
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "black" }}>
          {formattedValue}
        </Text>
      );
    },
    [formatToCurrency, parseCurrencyToNumber, placeholder],
  );

  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText(text);
    },
    [onChangeText],
  );

  return (
    <>
      {label && (
        <Text className="text-primary text-lg font-bold mb-2">{label}</Text>
      )}
      <MaskedInput
        migrate
        keyboardType="numeric"
        className=""
        containerStyle={style}
        renderMaskedText={renderMaskedText}
        formatter={formatter}
        initialValue={value}
        onChangeText={handleChangeText}
        onBlur={onBlur}
        maxLength={maxLength}
      />
    </>
  );
};
