export const useNumbers = () => {
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

	const formatCompactNumber = (number: number): string => {
		if (number < 1000) {
			return number.toString()
		} else if (number >= 1000 && number < 1_000_000) {
			return (number / 1000).toFixed(0) + ' K'
		} else if (number >= 1_000_000 && number < 1_000_000_000) {
			return (number / 1_000_000).toFixed(0) + ' M'
		} else if (number >= 1_000_000_000 && number < 1_000_000_000_000) {
			return (number / 1_000_000_000).toFixed(0) + ' B'
		} else if (number >= 1_000_000_000_000 && number < 1_000_000_000_000_000) {
			return (number / 1_000_000_000_000).toFixed(0) + ' T'
		}
		return ''
	}

	return {
		formatToCurrency,
		parseCurrencyToNumber,
		isFormattedPartially,
		formatCompactNumber,
	}
}
