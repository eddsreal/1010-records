import { PaymentMethodTypeEnum } from '@/common/enums/payment-methods.enum'
import { useNumbers } from '@/common/hooks/utilities/use-numbers.hook'
import { colors } from '@/common/styles/colors.styles'
import NewPaymentMethod from '@/components/molecules/new-payment-method.molecule'
import { useMenuStore } from '@/stores/menu.store'
import { usePaymentMethodsStore } from '@/stores/payment-methods.store'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { FlatList, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function PaymentMethods() {
	const insets = useSafeAreaInsets()
	const { paymentMethods } = usePaymentMethodsStore()
	const { formatToCurrency } = useNumbers()
	const [modalVisible, setModalVisible] = useState(false)

	return (
		<View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-deepBlue-800 p-4">
			<View className="flex-row justify-between items-center">
				<Text className="text-primary-500 text-5xl font-bold my-4">Métodos de pago</Text>
				<TouchableOpacity onPress={() => {
					router.dismissAll()
					useMenuStore.setState({ currentRoute: '/' })
				}}>
					<MaterialIcons name="close" size={36} color="white" />
				</TouchableOpacity>
			</View>

			<FlatList
				data={paymentMethods}
				renderItem={({ item }) => (
					<TouchableOpacity className="bg-deepBlue-600 rounded-lg p-4 mb-4 flex-row justify-between items-center">
						<View>
							<Text className="text-deepBlue-300 text-3xl font-bold">{item.name}</Text>
							<Text className="text-deepBlue-900 text-lg">{item.description}</Text>
							<Text className={`text-deepBlue-900 ${item.balance <= 0 ? 'text-red-500' : 'text-green-500'} text-lg`}>
								{formatToCurrency(item.balance)}
							</Text>
						</View>
						<View className="flex-row gap-2">
							{item.type === PaymentMethodTypeEnum.ACCOUNT && (
								<MaterialIcons name="account-balance" size={36} color={colors.deepBlue[900]} />
							)}
							{item.type === PaymentMethodTypeEnum.CARD && (
								<MaterialIcons name="credit-card" size={36} color={colors.deepBlue[900]} />
							)}
							{item.type === PaymentMethodTypeEnum.CASH && (
								<MaterialIcons name="attach-money" size={36} color={colors.deepBlue[900]} />
							)}
						</View>
					</TouchableOpacity>
				)}
			/>

			<View className="flex-row justify-between items-center">
				<Pressable className="bg-primary-500 rounded-full py-4 px-8" onPress={() => setModalVisible(true)}>
					<Text className="text-deepBlue-900 text-xl font-bold">Agregar cuenta</Text>
				</Pressable>
			</View>

			<Modal
				transparent={true}
				visible={modalVisible}
				animationType="slide"
				onRequestClose={() => setModalVisible(false)}
			>
				<NewPaymentMethod onClose={() => setModalVisible(false)} />
			</Modal>
		</View>
	)
}
