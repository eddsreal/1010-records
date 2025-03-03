import { useMemo } from "react";

export const useCurrency = () => {
  const formatter = useMemo(() => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const formatToCurrency = (value: number): string => {
    return formatter.format(value);
  };

  const parseCurrencyToNumber = (value: string): number => {
    const cleanValue = value.replace(/[^0-9,-]/g, "").replace(",", ".");
    return Number(cleanValue);
  };

  return {
    formatToCurrency,
    parseCurrencyToNumber,
  };
};
