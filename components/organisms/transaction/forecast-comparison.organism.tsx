import { TransactionFormValues } from '@/app/(tabs)/new-transaction'
import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { useCurrency } from '@/common/hooks/utilities/use-currency.hook'
import { useTransactionsStore } from '@/stores/transactions.store'
import React, { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Text, View } from 'react-native'

export const ForecastComparison: React.FC = () => {
	const { formatToCurrency } = useCurrency()
	const { getForecastComparison } = useForecasts()
	const { month, newTransaction } = useTransactionsStore()
	const { watch } = useFormContext<TransactionFormValues>()
	const priorityId = newTransaction.selectedPriority?.id
	const categoryId = watch('category')
	const amount = watch('amount')
	const [proyected, setProyected] = useState<number>(0)
	const [isMoreThanProyected, setIsMoreThanProyected] = useState<boolean>(false)
	const [isZero, setIsZero] = useState<boolean>(false)
	const [difference, setDifference] = useState<number>(0)
	const [executed, setExecuted] = useState<number>(0)

	useEffect(() => {
		const innerGetForecastComparison = async () => {
			const { proyected, isMoreThanProyected, isZero, difference, executed } = await getForecastComparison({
				priorityId,
				categoryId,
				month: Number(month),
				amount,
			})
			setProyected(proyected)
			setIsMoreThanProyected(isMoreThanProyected)
			setIsZero(isZero)
			setDifference(difference)
			setExecuted(executed)
		}
		innerGetForecastComparison()
	}, [month])

	return (
		<View className="mb-4">
			<Text className="text-primary text-lg font-bold">Comparación de gastos</Text>
			<View className="flex-row gap-4 items-center justify-center p-4">
				<View>
					<Text className="text-app-gray text-lg font-bold">Proyectado</Text>
					<Text className="text-app-gray text-lg font-bold">{formatToCurrency(proyected)}</Text>
				</View>
				<View>
					<Text className="text-app-gray text-lg font-bold">Ejecutado + Esta Transacción</Text>
					<Text className="text-app-gray text-lg font-bold">
						{executed
							? `${formatToCurrency(Number(executed))} + ${formatToCurrency(Number(amount))}`
							: formatToCurrency(amount)}
					</Text>
				</View>
			</View>
			<View className="flex-row gap-4 items-center justify-center p-4">
				<Text className="text-app-gray text-lg font-bold">
					{isMoreThanProyected && !isZero
						? `Estás ${formatToCurrency(difference * -1)} por encima de lo proyectado`
						: ''}
					{!isMoreThanProyected && !isZero
						? `Aún tienes ${formatToCurrency(difference)} presupuestado para este mes`
						: ''}
					{isZero ? 'Muy bien! estás sin fugas de dinero' : ''}
				</Text>
			</View>
		</View>
	)
}
