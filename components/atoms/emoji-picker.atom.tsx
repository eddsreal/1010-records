import React, { useState } from 'react'
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native'

const commonEmojis = [
	'💰',
	'💳',
	'💵',
	'🏦',
	'📊',
	'📈',
	'📉',
	'🛒',
	'🎯',
	'💹',
	'🏠',
	'🚗',
	'✈️',
	'🍔',
	'👕',
	'💊',
	'🎓',
	'🎉',
]

export const EmojiPicker = ({
	value,
	onChange,
	placeholder,
}: {
	value: string
	onChange: (emoji: string) => void
	placeholder: string
}) => {
	const [modalVisible, setModalVisible] = useState(false)

	const selectEmoji = (emoji: string) => {
		onChange(emoji)
		setModalVisible(false)
	}

	return (
		<View>
			<TouchableOpacity onPress={() => setModalVisible(true)} className="border-b border-gray-300 rounded-md p-4">
				<Text className="text-lg">{value || placeholder}</Text>
			</TouchableOpacity>

			<Modal
				transparent={true}
				visible={modalVisible}
				animationType="slide"
				onRequestClose={() => setModalVisible(false)}
			>
				<View className="flex-1 justify-end ">
					<View className="bg-white p-4 rounded-t-lg">
						<Text className="text-xl font-bold mb-4">Selecciona un emoji</Text>
						<FlatList
							data={commonEmojis}
							numColumns={6}
							keyExtractor={(item) => item}
							renderItem={({ item }) => (
								<TouchableOpacity onPress={() => selectEmoji(item)} className="p-3 m-1 items-center justify-center">
									<Text className="text-3xl">{item}</Text>
								</TouchableOpacity>
							)}
						/>
						<TouchableOpacity
							onPress={() => setModalVisible(false)}
							className="mt-4 p-3 bg-gray-200 rounded-md items-center"
						>
							<Text>Cancelar</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	)
}
