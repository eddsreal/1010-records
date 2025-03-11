export const useCurrency = () => {
	const formatter = new Intl.NumberFormat('es-CO', {
		style: 'decimal',
		currency: 'COP',
		maximumFractionDigits: 2,
		minimumFractionDigits: 0,
	})

	const formatToCurrency = (value: number): string => {
		const formattedNumber = formatter.format(value)
		return formattedNumber === 'NaN' ? '' : formattedNumber
	}

	const parseCurrencyToNumber = (value: string): number => {
		const cleanValue = value.replace(/[^0-9,-]/g, '')
		return parseFloat(cleanValue.replace(',', '.'))
	}

	const isFormattedPartially = (value: string): boolean => {
		return value.endsWith(',') || value.endsWith('.') || value === '-'
	}

	return {
		formatToCurrency,
		parseCurrencyToNumber,
		isFormattedPartially,
	}
}
