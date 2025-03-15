import { useNumbers } from '@/common/hooks/utilities/use-numbers.hook'
import { colors } from '@/common/styles/colors.styles'
import React from 'react'
import { Text, View } from 'react-native'

type Props = {
	monthName: string
	priorityColor?: string | null
	amount: number
}

export const MonthCell: React.FC<Props> = ({ monthName, amount, priorityColor }) => {
	const { formatToCurrency } = useNumbers()

	return (
		<View className="py-2 px-4 border-r border-gray-200 items-center">
			<Text style={{ color: priorityColor ? priorityColor : colors.secondary }} className="text-sm font-bold capitalize">{monthName}</Text>
			<Text className="text-lg mt-1 text-white w-32 overflow-clip text-center">{formatToCurrency(amount)}</Text>
		</View>
	)
}
