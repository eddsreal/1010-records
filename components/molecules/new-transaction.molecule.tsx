import { TransactionTypeEnum } from '@/common/enums/transactions.enum'
import { usePriorities } from '@/common/hooks/database/use-priorities.hook'
import { RelativeDateEnum } from '@/common/hooks/utilities/use-dates.hook'
import { MaterialIcons } from '@expo/vector-icons'
import { useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Picker } from 'react-native-ui-lib'
import { AutoSuggestInput } from '../atoms/auto-suggest-input.atom'
import { CurrencyInput } from '../atoms/currency-input.atom'

interface PeriodOption {
	label: string
	value: RelativeDateEnum
}

const periodOptions: PeriodOption[] = [
	{ label: 'Hoy', value: RelativeDateEnum.TODAY },
	{ label: 'Ayer', value: RelativeDateEnum.YESTERDAY },
]

const categories = [
	{ id: 1, name: 'Comida', icon: '🌭' },
	{ id: 2, name: 'Transporte', icon: '🚗' },
	{ id: 3, name: 'Hogar', icon: '🏠' },
]

const searchCategories = (search: string) => {
	return categories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase()))
}

export const NewTransaction: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption | null>(periodOptions[0])
	const [amount, setAmount] = useState<number>()
	const [transactionType, setTransactionType] = useState<TransactionTypeEnum>(TransactionTypeEnum.INCOME)
	const [description, setDescription] = useState<string>('')
	const [category, setCategory] = useState<{ id: string | number; name: string; icon: string } | null>(null)
	const { getCagetoriesByQueryAndType } = usePriorities()

	const handleSearchCategories = async (search: string) => {
		const categories = await getCagetoriesByQueryAndType(search, transactionType)
		return categories.map((category) => ({
			...category,
			icon: category.icon || '',
			color: category.color || undefined,
		}))
	}

	const handleSaveTransaction = async () => {
		const transaction = {
			amount,
			description,
			categoryId: category?.id,
		}
		console.log(transaction)
	}
	return (
		<View className="flex-1 justify-center bg-deepBlue-900 flex-col p-4">
			<View className="flex-row items-center justify-between gap-2 w-full">
				<Text
					className={`${transactionType === TransactionTypeEnum.INCOME ? 'text-primary-500' : 'text-secondary-500'} text-4xl font-robotoBold mb-4`}
				>
					Registro
				</Text>
				<TouchableOpacity onPress={onClose}>
					<MaterialIcons name="close" size={36} color="white" />
				</TouchableOpacity>
			</View>
			<View className="flex-row w-full gap-2">
				<Picker
					value={selectedPeriod?.value}
					onChange={(value) => {
						setSelectedPeriod(periodOptions.find((option) => option.value === value) || null)
					}}
					renderInput={() => {
						return (
							<View className="bg-deepBlue-600 px-4 py-1 rounded-lg flex-row items-center">
								<Text className="text-white font-robotoRegular text-lg">{selectedPeriod?.label}</Text>
								<MaterialIcons
									name="chevron-right"
									size={24}
									color="white"
									style={{ transform: [{ rotate: '90deg' }] }}
								/>
							</View>
						)
					}}
				>
					{periodOptions.map((option) => (
						<Picker.Item key={option.value} label={option.label} value={option.value} />
					))}
				</Picker>
				<View className="flex-row items-center">
					<TouchableOpacity
						className={`${transactionType === TransactionTypeEnum.INCOME ? 'bg-primary-500' : 'bg-deepBlue-600'} px-4 py-2 rounded-l-lg`}
						onPress={() => setTransactionType(TransactionTypeEnum.INCOME)}
					>
						<MaterialIcons name="add" size={18} color="white" />
					</TouchableOpacity>
					<TouchableOpacity
						className={`${transactionType === TransactionTypeEnum.EXPENSE ? 'bg-secondary-500' : 'bg-deepBlue-600'} px-4 py-2 rounded-r-lg`}
						onPress={() => setTransactionType(TransactionTypeEnum.EXPENSE)}
					>
						<MaterialIcons name="remove" size={18} color="white" />
					</TouchableOpacity>
				</View>
			</View>
			<View className="flex-row w-full mt-4">
				<CurrencyInput value={amount} onChange={setAmount} minValue={1} placeholder="Monto" />
			</View>
			<View className="flex-row w-full mt-4">
				<TextInput
					className="p-4 w-full bg-deepBlue-600 rounded-lg text-white text-2xl font-robotoBlack placeholder:text-deepBlue-700"
					placeholder="Descripción"
					value={description}
					onChangeText={setDescription}
				/>
			</View>
			<View className="flex-col w-full mt-4">
				<AutoSuggestInput
					placeholder="Categoria"
					value={category}
					onChange={setCategory}
					searchItems={handleSearchCategories}
				/>
			</View>
			<View className="flex-row w-full mt-4">
				<TouchableOpacity
					className={`${transactionType === TransactionTypeEnum.INCOME ? 'bg-primary-500' : 'bg-secondary-500'} px-4 py-2 rounded-lg`}
					onPress={handleSaveTransaction}
				>
					<Text className="text-white font-robotoRegular text-lg">Guardar</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
