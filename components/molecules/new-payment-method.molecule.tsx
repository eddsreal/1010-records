import { PaymentMethodTypeEnum } from '@/common/enums/payment-methods.enum'
import { PaymentMethod } from '@/common/hooks/database/schema'
import { usePaymentMethods } from '@/common/hooks/database/use-payment-methods.hook'
import { colors } from '@/common/styles/colors.styles'
import { MaterialIcons } from '@expo/vector-icons'
import { Controller, useForm } from 'react-hook-form'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
interface NewPaymentMethodForm {
	name: string
	description: string
	type: PaymentMethodTypeEnum
}

export const NewPaymentMethod: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	const { control, handleSubmit, watch, setValue, reset } = useForm<NewPaymentMethodForm>({
		defaultValues: {
			name: '',
			description: '',
			type: PaymentMethodTypeEnum.ACCOUNT,
		},
	})

	const type = watch('type')

	const { createPaymentMethod } = usePaymentMethods()

	const handleSavePaymentMethod = async (data: NewPaymentMethodForm) => {
		await createPaymentMethod({
			type: data.type,
			name: data.name,
			description: data.description,
		} as PaymentMethod)
		onClose()
	}

	const renderHeader = () => {
		return (
			<View className="flex-row items-center justify-between gap-2 w-full mb-8">
				<Text className={`text-primary-500 text-4xl font-robotoBold mb-4`}>Agregar método de pago</Text>
				<TouchableOpacity onPress={onClose}>
					<MaterialIcons name="close" size={36} color="white" />
				</TouchableOpacity>
			</View>
		)
	}
	const renderForm = () => {
		return (
			<View>
				<View className="flex-row w-full mt-4">
					<Controller
						control={control}
						name="name"
						render={({ field }) => (
							<TextInput
								className="p-4 w-full bg-deepBlue-600 rounded-lg text-white text-2xl font-robotoBlack placeholder:text-deepBlue-700"
								placeholder="Nombre"
								value={field.value}
								onChangeText={field.onChange}
							/>
						)}
					/>
				</View>
				<View className="flex-row w-full mt-4">
					<Controller
						control={control}
						name="description"
						render={({ field }) => (
							<TextInput
								className="p-4 w-full bg-deepBlue-600 rounded-lg text-white text-2xl font-robotoBlack placeholder:text-deepBlue-700"
								placeholder="Descripción"
								value={field.value}
								onChangeText={field.onChange}
							/>
						)}
					/>
				</View>
				<View className="flex-col w-full mt-4">
					<Text className="text-deepBlue-500 text-2xl font-robotoBlack">Tipo</Text>
					<View className="flex-row items-center justify-around gap-2">
						<TouchableOpacity
							className={`p-4 items-center justify-center bg-deepBlue-600 rounded-lg text-white text-2xl font-robotoBlack ${
								type === PaymentMethodTypeEnum.ACCOUNT ? 'bg-primary-500' : 'bg-deepBlue-600'
							}`}
							onPress={() => setValue('type', PaymentMethodTypeEnum.ACCOUNT)}
						>
							<MaterialIcons
								name="account-balance"
								size={36}
								color={type === PaymentMethodTypeEnum.ACCOUNT ? colors.deepBlue[900] : colors.deepBlue[800]}
							/>
							<Text
								className={`text-white text-sm font-robotoBlack ${type === PaymentMethodTypeEnum.ACCOUNT ? 'text-deepBlue-900' : 'text-deepBlue-800'}`}
							>
								Cuenta
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className={`p-4 items-center justify-center bg-deepBlue-600 rounded-lg text-white text-2xl font-robotoBlack ${
								type === PaymentMethodTypeEnum.CARD ? 'bg-primary-500' : 'bg-deepBlue-600'
							}`}
							onPress={() => setValue('type', PaymentMethodTypeEnum.CARD)}
						>
							<MaterialIcons
								name="credit-card"
								size={36}
								color={type === PaymentMethodTypeEnum.CARD ? colors.deepBlue[900] : colors.deepBlue[800]}
							/>
							<Text
								className={`text-white text-sm font-robotoBlack ${type === PaymentMethodTypeEnum.CARD ? 'text-deepBlue-900' : 'text-deepBlue-800'}`}
							>
								Tarjeta
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className={`p-4 items-center justify-center bg-deepBlue-600 rounded-lg text-white text-2xl font-robotoBlack ${
								type === PaymentMethodTypeEnum.CASH ? 'bg-primary-500' : 'bg-deepBlue-600'
							}`}
							onPress={() => setValue('type', PaymentMethodTypeEnum.CASH)}
						>
							<MaterialIcons
								name="attach-money"
								size={36}
								color={type === PaymentMethodTypeEnum.CASH ? colors.deepBlue[900] : colors.deepBlue[800]}
							/>
							<Text
								className={`text-white text-sm font-robotoBlack ${type === PaymentMethodTypeEnum.CASH ? 'text-deepBlue-900' : 'text-deepBlue-800'}`}
							>
								Efectivo
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		)
	}
	const renderFooter = () => {
		return (
			<View className="flex-row w-full mt-4 justify-end">
				<TouchableOpacity
					className={`bg-primary-500 px-4 py-2 rounded-lg`}
					onPress={handleSubmit(handleSavePaymentMethod)}
				>
					<Text className="text-deepBlue-900 font-robotoRegular text-lg">Guardar</Text>
				</TouchableOpacity>
			</View>
		)
	}
	return (
		<View className="flex-1 justify-center bg-deepBlue-900 flex-col p-4">
			{renderHeader()}
			{renderForm()}
			{renderFooter()}
		</View>
	)
}

export default NewPaymentMethod
