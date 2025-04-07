import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import { Transaction } from '@/common/hooks/database/schema'
import { useTransactions } from '@/common/hooks/database/use-transactions.hook'
import { useNumbers } from '@/common/hooks/utilities/use-numbers.hook'
import { useMenuStore } from '@/stores/menu.store'
import { usePrioritiesStore } from '@/stores/priorities.store'
import { useTransactionsStore } from '@/stores/transactions.store'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { FlatList, Pressable, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const TransactionListItem = ({
	transaction,
	handleEditTransaction,
	isPending,
}: {
	transaction: Transaction
	handleEditTransaction: (transaction: Transaction) => void
	isPending: boolean
}) => {
	const { formatToCurrency } = useNumbers()
	const { priorities } = usePrioritiesStore()
	const priority = priorities.find((priority) => priority.id === transaction.priorityId)
	const borderColor = priority?.color && !isPending ? priority.color : '#232B5D'
	const backgroundColor = priority?.color && !isPending ? priority.color : '#232B5D'

	return (
		<TouchableOpacity
			className="flex-row justify-between items-center mb-4"
			onPress={() => handleEditTransaction(transaction)}
		>
			<View className="flex-row items-center gap-2 w-2/12">
				<View style={{ borderColor }} className={`flex-col items-center border-2 rounded-md`}>
					<View style={{ backgroundColor }} className={`py-2 px-4`}>
						<Text className="text-white font-robotoBlack text-2xl">{moment(transaction.createdAt).format('DD')}</Text>
					</View>
					<Text className="text-white font-robotoRegular text-xs">{moment(transaction.createdAt).format('MMMM')}</Text>
					<Text className="text-white font-robotoRegular text-xs">{moment(transaction.createdAt).format('YYYY')}</Text>
				</View>
			</View>
			<View className="flex-row items-center p-2 w-7/12">
				<Text className="text-white font-robotoRegular text-lg">
					{transaction.description ? transaction.description : 'Sin descripción'}
				</Text>
			</View>
			<View className="flex-row items-center justify-end p-2 w-3/12">
				<Text
					className={`font-robotoRegular text-lg text-right ${transaction.type === TransactionTypeEnum.INCOME ? 'text-green-500' : 'text-red-500'}`}
				>
					{transaction.type === TransactionTypeEnum.INCOME ? '+ ' : '- '} 
					{formatToCurrency(transaction.amount)}
				</Text>
			</View>
		</TouchableOpacity>
	)
}

export default function Transactions() {
	useTransactions()
	const insets = useSafeAreaInsets()
	const { pendingTransactions, latestTransactions } = useTransactionsStore()
	const [modalVisible, setModalVisible] = useState(false)

	useEffect(() => {
		useTransactionsStore.setState({ refreshTransactions: true })
	}, [])

	const handleEditTransaction = (transaction: Transaction) => {
		useTransactionsStore.setState({
			editTransaction: transaction,
		})
		setModalVisible(true)
	}

	return (
		<View
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
			className="flex-col h-full bg-deepBlue-800 justify-between p-4"
		>
			<View className="flex-row justify-between items-center my-8">
				<Text className="text-white font-robotoBold text-3xl">Transacciones</Text>
				<Pressable onPress={() => {
					router.dismissAll()
					useMenuStore.setState({ currentRoute: '/' })
				}}>
					<MaterialIcons name="close" size={30} color="white" />
				</Pressable>
			</View>

			<View className="h-3/6 p-2">
				<View className="flex-row items-center gap-2 my-4">
					<MaterialIcons name="access-time" size={30} color="white" />
					<Text className="text-white font-robotoBold text-2xl">Pendientes</Text>
				</View>
				<View className="flex-row items-center gap-2">
					{pendingTransactions.length === 0 && (
						<Text className="text-white font-robotoRegular text-lg">No hay transacciones pendientes</Text>
					)}
				</View>
				<FlatList
					data={pendingTransactions}
					renderItem={({ item }) => (
						<TransactionListItem transaction={item} handleEditTransaction={handleEditTransaction} isPending={true} />
					)}
				/>
			</View>

			<View className="h-3/6 p-2">
				<View className="flex-row items-center gap-2 my-4">
					<MaterialIcons name="calendar-month" size={30} color="white" />
					<Text className="text-white font-robotoBold text-2xl">Últimos 30 días</Text>
				</View>
				{latestTransactions.length === 0 && (
					<Text className="text-white font-robotoRegular text-lg">No hay transacciones en los últimos 30 días</Text>
				)}
				<FlatList
					data={latestTransactions}
					renderItem={({ item }) => {
						return (
							<TransactionListItem transaction={item} handleEditTransaction={handleEditTransaction} isPending={false} />
						)
					}}
				/>
			</View>
		</View>
	)
}
