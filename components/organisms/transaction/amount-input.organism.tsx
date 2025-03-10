import { useCurrency } from "@/common/hooks/utilities/use-currency.hook";
import React, { useCallback } from "react";
import { Text, ViewStyle } from "react-native";
import { MaskedInput } from "react-native-ui-lib";

interface Props {
  value: string | undefined;
  placeholder?: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  containerStyle?: ViewStyle;
  placeholderClassName?: string;
  maxLength?: number;
  label?: string;
}

export const CurrencyMaskedInput: React.FC<Props> = ({
  value,
  placeholder,
  onChangeText,
  onBlur,
  containerStyle,
  placeholderClassName,
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
          <Text className={placeholderClassName || "text-gray-500"}>
            {placeholder || "Ingrese un monto"}
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
    [
      formatToCurrency,
      parseCurrencyToNumber,
      placeholder,
      placeholderClassName,
    ],
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
        <Text className="text-secondary text-lg font-bold mb-2">{label}</Text>
      )}
      <MaskedInput
        migrate
        keyboardType="numeric"
        containerStyle={containerStyle}
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
