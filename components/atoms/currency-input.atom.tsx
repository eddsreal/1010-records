import { useNumbers } from '@/common/hooks/utilities/use-numbers.hook'
import useValue from '@/common/hooks/utilities/use-value.hook'
import React, { useCallback } from 'react'
import { NativeSyntheticEvent, TextInput, TextInputChangeEventData } from 'react-native'

type Props = {
	value?: number
	onChange?: (amount: number) => void
	minValue?: number
	maxValue?: number
	placeholder?: string
}

export const CurrencyInput = ({
	minValue = -999999999999999,
	maxValue = 999999999999999,
	onChange,
	value,
	...restProps
}: Props) => {
	const { parseCurrencyToNumber, formatToCurrency, isFormattedPartially } = useNumbers()
	const isValid = useCallback(
		(newValue: number) => {
			if ((minValue !== undefined && newValue < minValue) || (maxValue !== undefined && newValue > maxValue)) {
				return false
			}
			return true
		},
		[minValue, maxValue],
	)
	const { formattedValue, onChangeValue } = useValue<number, string>({
		onChange,
		value,
		getFormattedValue: formatToCurrency,
		isFormattedPartially,
		isValid,
		getUnformattedValue: parseCurrencyToNumber,
	})

	const _onChange = useCallback(
		(e: NativeSyntheticEvent<TextInputChangeEventData>) => {
			onChangeValue(e.nativeEvent.text)
		},
		[onChangeValue],
	)
	return (
		<TextInput
			className="p-4 w-full bg-deepBlue-600 rounded-lg text-white text-4xl font-robotoBlack placeholder:text-deepBlue-700"
			onChange={_onChange}
			value={formattedValue}
			keyboardType="numeric"
			numberOfLines={1}
			{...restProps}
		/>
	)
}
