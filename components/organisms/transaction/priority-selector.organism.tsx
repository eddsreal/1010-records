import { TransactionFormValues } from '@/app/(tabs)/new-transaction'
import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import { colors } from '@/common/styles/colors.styles'
import { Category } from '@/database/schema'
import { usePrioritiesStore } from '@/stores/priorities.store'
import { useTransactionsStore } from '@/stores/transactions.store'
import { router } from 'expo-router'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Pressable, Text, View } from 'react-native'
import { Picker } from 'react-native-ui-lib'

export const PrioritySelector: React.FC = () => {
	const { priorities } = usePrioritiesStore()
	const { newTransaction } = useTransactionsStore()
	const selectedPriority = newTransaction.selectedPriority
	const { control } = useFormContext<TransactionFormValues>()

	return (
		<View className="mb-4">
			<Text className="text-primary text-lg font-bold">Prioridad</Text>

			<View className="flex-row gap-4 items-center justify-center p-4">
				<View
					className={`flex-col gap-4 items-start justify-start ${newTransaction.selectedPriority ? 'w-1/2' : 'w-full'}`}
				>
					{priorities
						.filter((priority) => priority.priorityType === TransactionTypeEnum.EXPENSE)
						.map((priority) => {
							const isSelected = newTransaction.selectedPriority?.id === priority.id
							return (
								<Pressable
									key={priority.id}
									className={`py-2 px-4 rounded-md w-full`}
									onPress={() =>
										useTransactionsStore.setState({
											newTransaction: {
												...newTransaction,
												selectedPriority: priority,
											},
										})
									}
								>
									<View className="flex-row items-center gap-2">
										<Text
											style={{
												backgroundColor: priority.color ? priority.color : colors.primary,
												opacity: isSelected ? 1 : 0.5,
											}}
											className="py-2 px-4 rounded-md"
										>
											{priority.icon}
										</Text>
										<Text 
											style={{
												color: isSelected && priority.color ? priority.color : colors.appGray,
											}}
											className={`${isSelected ? 'opacity-100' : 'opacity-20'} text-app-gray font-bold`}
										>
											{priority.name}
										</Text>
									</View>
								</Pressable>
							)
						})}
				</View>
				{selectedPriority && (
					<View className="flex-col gap-4 items-center justify-start w-1/2 h-full">
						<View>
							<Text className="text-primary text-lg font-bold">Prioridad seleccionada</Text>
							<Text className="text-app-gray text-lg font-bold">
								{selectedPriority?.icon} - {selectedPriority?.name}
							</Text>
						</View>
						{!selectedPriority.categories.length ? (
							<View className="flex-col items-start gap-2 border border-gray-200 rounded-xl p-2">
								<Text className="text-app-gray text-lg font-bold">No hay categorías</Text>
								<Pressable
									className="py-2 px-4 rounded-md bg-primary"
									onPress={() => router.push('/categories-wizzard')}
								>
									<Text className="text-white text-lg font-bold">Agregar categoría</Text>
								</Pressable>
							</View>
						) : (
							<Controller
								control={control}
								name="category"
								render={({ field: { onChange, onBlur, value } }) => (
									<Picker
										value={value}
										placeholder={'Selecciona una categoría'}
										onChange={(itemValue) => onChange(itemValue)}
										showSearch
										searchPlaceholder={'Buscar categoría'}
										renderInput={(value: number | undefined) => {
											const category = selectedPriority.categories.find((category: Category) => category.id === value)
											return (
												<View className="flex-row items-center gap-2 border border-gray-200 rounded-xl px-8 py-2">
													{!value ? (
														<Text className="text-app-gray text-lg font-bold">Categoría</Text>
													) : (
														<Text className="text-app-gray text-lg font-bold">
															{value ? `${category?.icon} - ${category?.name}` : 'Selecciona una categoría'}
														</Text>
													)}
												</View>
											)
										}}
										searchStyle={{
											color: 'black',
											placeholderTextColor: 'gray',
										}}
									>
										{selectedPriority.categories.map((category: Category) => (
											<Picker.Item
												key={category.id}
												label={`${category.icon} - ${category.name}`}
												value={category.id}
											/>
										))}
									</Picker>
								)}
							/>
						)}
					</View>
				)}
			</View>
		</View>
	)
}
