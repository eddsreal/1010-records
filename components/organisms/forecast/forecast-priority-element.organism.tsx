import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { usePriorities } from '@/common/hooks/database/use-priorities.hook'
import { colors } from '@/common/styles/colors.styles'
import { EmojiPicker } from '@/components/atoms/emoji-picker.atom'
import { Category, ForecastDetail } from '@/database/schema'
import { useForecastsStore } from '@/stores/forecasts.store'
import { PriorityWithCategories } from '@/stores/priorities.store'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { MonthCell } from './month-cell.organism'

const months = Array.from({ length: 12 }).map((_, monthIndex) => {
	return new Date(2024, monthIndex).toLocaleString('es-CO', {
		month: 'long',
	})
})

type Props = {
	priority: PriorityWithCategories
}

interface FormData {
	name: string
	description: string
	icon: string
}

export const ForecastPriorityElement: React.FC<Props> = ({ priority }) => {
	const { register, getValues, handleSubmit, control, reset } = useForm<FormData>()
	const [isAddingCategory, setIsAddingCategory] = useState(false)
	const { forecastDetailModal } = useForecastsStore()
	const [forecastDetail, setForecastDetail] = useState<ForecastDetail[]>([])
	const { getForecastDetail } = useForecasts()
	const { createCategory } = usePriorities()

	const getForecastDetailValues = async () => {
		const forecastDetail = await getForecastDetail({ priorityId: priority.id })
		setForecastDetail(forecastDetail as ForecastDetail[])
	}

	useEffect(() => {
		if (priority) {
			getForecastDetailValues()
		}
	}, [priority, forecastDetailModal])

	const onSubmit = async (data: FormData) => {
		await createCategory({
			name: data.name,
			description: data.description,
			categoryType: priority.priorityType,
			icon: data.icon,
			color: '#000000',
			priorityId: priority.id,
			isDeleted: false,
		} as Category)
		setIsAddingCategory(false)
		reset()
		await getForecastDetailValues()
	}

	return (
		<View className="p-4">
			<Text style={{ color: priority.color ? priority.color : colors.primary }} className="text-3xl font-bold">
				{priority.name}
			</Text>

			<View className="mt-4">
				{priority.categories?.map((category: Category) => (
					<View key={category.id} className="flex-row items-center mb-4">
						<TouchableOpacity
							className="w-4/12"
							onPress={() => {
								useForecastsStore.setState({
									forecastDetailModal: {
										priority,
										category,
									},
								})
								router.push({
									pathname: '/edit-forecast-element',
								})
							}}
						>
							<Text className="text-gray-500 text-lg font-bold">
								{category.icon} {category.name}
							</Text>
						</TouchableOpacity>
						<View className="w-8/12">
							<ScrollView horizontal>
								{months.map((month, monthIndex) => {
									const monthData = forecastDetail?.find(
										(fd) =>
											fd.month === monthIndex + 1 && fd.categoryId === category.id && fd.priorityId === priority.id,
									)
									const amount = monthData?.amount || 0

									return <MonthCell key={monthIndex} monthName={month} amount={amount} priorityColor={priority?.color} />
								})}
							</ScrollView>
						</View>
					</View>
				))}
				{priority.categories?.length === 0 && (
					<View className="mt-4">
						<Text className="text-gray-500 text-lg font-bold mb-4">No hay categorías para esta prioridad</Text>
					</View>
				)}

				{isAddingCategory && (
					<View className="mt-4 flex-col gap-4">
						<Text className="text-gray-500 text-lg font-bold mb-4">Agregar categoría</Text>
						<Controller
							control={control}
							name="name"
							render={({ field }) => (
								<TextInput
									placeholder="Nombre de la categoría"
									className="border-b border-gray-300 rounded-md p-4 text-lg"
									onChangeText={field.onChange}
									onBlur={field.onBlur}
									value={field.value}
								/>
							)}
						/>
						<Controller
							control={control}
							name="description"
							render={({ field }) => (
								<TextInput
									placeholder="Descripción de la categoría"
									className="border-b border-gray-300 rounded-md p-4 text-lg"
									onChangeText={field.onChange}
									onBlur={field.onBlur}
									value={field.value}
								/>
							)}
						/>
						<Controller
							control={control}
							name="icon"
							render={({ field }) => (
								<EmojiPicker value={field.value} onChange={field.onChange} placeholder="Icono de la categoría" />
							)}
						/>
						<Pressable
							style={{ backgroundColor: priority.color ? priority.color : colors.primary }}
							className="p-4 rounded-md"
							onPress={handleSubmit(onSubmit)}
						>
							<Text className="text-white text-lg font-bold">Agregar categoría</Text>
						</Pressable>
					</View>
				)}

				{!isAddingCategory && (
					<Pressable
						style={{ backgroundColor: priority.color ? priority.color : colors.primary }}
						className="p-2 rounded-md"
						onPress={() => {
							setIsAddingCategory(true)
						}}
					>
						<Text className="text-white text-lg font-bold">Agregar categoría</Text>
					</Pressable>
				)}
			</View>
		</View>
	)
}
