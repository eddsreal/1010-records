import { MaterialIcons } from '@expo/vector-icons'
import { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

type Option = {
	label: string
	value: string
}

type Props = {
	label: string
	options: Option[]
	value: string
	onChange: (value: string) => void
}

export const PickerAtom = ({ label, options, value, onChange }: Props) => {
	const [isOpen, setIsOpen] = useState(false)

	const handleChange = (option: string) => {
		onChange(option)
		setIsOpen(false)
	}

	return (
		<View className="flex-col items-center gap-2 bg-deepBlue-500 px-4 rounded-md relative">
			<TouchableOpacity className="flex-row items-center gap-2" onPress={() => setIsOpen(!isOpen)}>
				<Text className="text-white font-robotoRegular text-lg ">
					{value ? options.find((option) => option.value === value)?.label : label}
				</Text>
				<MaterialIcons
					name="chevron-right"
					size={24}
					color="white"
					style={{ transform: [{ rotate: `${isOpen ? '-90deg' : '90deg'}` }] }}
				/>
			</TouchableOpacity>
			{isOpen && (
				<View className="flex-col gap-4 absolute top-[110%] -left-[25%] py-2 right-0 bg-deepBlue-500 px-2 rounded-md w-[200%] z-10 border-2 border-deepBlue-800">
					{options.map((option) => (
						<TouchableOpacity className="w-full flex-row justify-center gap-2" key={option.value} onPress={() => handleChange(option.value)}>
							<Text className="text-white font-robotoRegular text-lg">{option.label}</Text>
						</TouchableOpacity>
					))}
				</View>
			)}
		</View>
	)
}
