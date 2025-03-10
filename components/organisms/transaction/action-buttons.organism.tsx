import { TransactionFormValues } from '@/app1/(tabs)/new-transaction'
import { TransactionFormTypeEnum } from '@/common/enums/transactions.enum'
import { useTransactionsStore } from '@/stores/transactions.store'
import { router } from 'expo-router'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Pressable, Text, View } from 'react-native'

type Props = {
	onSubmit: (data: TransactionFormValues) => void
}

export const ActionButtons: React.FC<Props> = ({ onSubmit }) => {
	const { newTransaction } = useTransactionsStore()
	const { handleSubmit, reset } = useFormContext<TransactionFormValues>()

	const handleCancel = () => {
		reset()

		useTransactionsStore.setState({
			mode: TransactionFormTypeEnum.FAST,
			newTransaction: {
				selectedPriority: null,
			},
			editTransaction: undefined,
		})

		router.back()
	}

	return (
		<View className="flex-row gap-4 items-center justify-center p-4">
			<Pressable className="py-2 px-4 rounded-md bg-secondary-500" onPress={handleSubmit(onSubmit)}>
				<Text className="text-white text-lg font-bold">Guardar</Text>
			</Pressable>
			<Pressable className="py-2 px-4 rounded-md bg-secondary-500" onPress={handleCancel}>
				<Text className="text-white text-lg font-bold">Cancelar</Text>
			</Pressable>
		</View>
	)
}
