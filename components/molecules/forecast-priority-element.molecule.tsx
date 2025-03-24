import { ForecastType } from '@/common/enums/forecast.enum'
import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import { Category } from '@/common/hooks/database/schema'
import { colors } from '@/common/styles/colors.styles'
import { useForecastsStore } from '@/stores/forecasts.store'
import { PriorityWithCategories } from '@/stores/priorities.store'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { MonthCell } from '../atoms/month-cell.atom'

const months = Array.from({ length: 12 }).map((_, monthIndex) => {
	return new Date(2024, monthIndex).toLocaleString('es-CO', {
		month: 'long',
	})
})

type Props = {
	priority: PriorityWithCategories
}

export const ForecastPriorityElement: React.FC<Props> = ({ priority }) => {
	const { forecastsDetailElement, type } = useForecastsStore()

	return (
		<ScrollView className="p-4">
			<Text style={{ color: priority.color ? priority.color : colors.secondary }} className="text-3xl font-bold">
				{priority.name}
			</Text>

			<View className="mt-4">
				{priority.categories?.map((category: Category) => {
					const categoryData = forecastsDetailElement.find((fd) => fd.category?.id === category.id)
					return (
						<View key={category.id} className="flex-row items-center mb-4">
							<TouchableOpacity
								className="w-4/12 flex-row items-center gap-2"
								onPress={() => {
									useForecastsStore.setState({
										editForecastDetail: {
											id: categoryData?.id || category.id,
											forecastDetailId: categoryData?.forecastDetailId,
											monthsValues: categoryData?.monthsValues,
											priorityId: priority.id,
											transactionType: category.categoryType as TransactionTypeEnum,
											category,
										},
									})
									router.push({
										pathname: '/upsert/forecast',
									})
								}}
							>
								<Text className="text-white text-lg font-bold">
									{category.icon} {category.name}
								</Text>
								{type === ForecastType.PROJECTED && (
									<Ionicons name="create" color={priority.color || colors.secondary} size={25} />
								)}
							</TouchableOpacity>
							<View className="w-8/12">
								<ScrollView horizontal>
									{months.map((month, monthIndex) => {
										const monthData = categoryData?.monthsValues?.[monthIndex + 1]
										const amount = monthData || 0

										return (
											<MonthCell key={monthIndex} monthName={month} amount={amount} priorityColor={priority?.color} />
										)
									})}
								</ScrollView>
							</View>
						</View>
					)
				})}
				{priority.categories?.length === 0 && (
					<View className="mt-4">
						<Text className="text-white text-lg font-bold mb-4">No hay categorías para esta prioridad</Text>
					</View>
				)}
			</View>
		</ScrollView>
	)
}
