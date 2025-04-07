import React, { useState } from 'react'
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
const commonEmojis = [
	'💰', '💵', '💸', '💳', '💴', '💶', '💷', '🏦', '📊', '📈',
	'📉', '🧾', '🛒', '🛍️', '🏠', '🚗', '✈️', '🍔', '☕', '🍕',
	'👔', '👗', '👟', '💼', '💻', '📱', '🔋', '⛽', '🚌', '🏥',
	'💊', '🎓', '📚', '🎬', '🎮', '🎵', '🏋️', '💝', '🎁', '💅',
	'💇', '🚿', '🧹', '🧺', '🔨', '👶', '🐶', '🐱', '🌱', '🔆'
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
	const insets = useSafeAreaInsets()

	const selectEmoji = (emoji: string) => {
		onChange(emoji)
		setModalVisible(false)
	}

	return (
		<View style={{ paddingBottom: insets.bottom }}>
			<TouchableOpacity onPress={() => setModalVisible(true)} className="p-4 w-full bg-deepBlue-600 rounded-lg  ">
				<Text className={`text-2xl font-robotoBlack ${value ? 'text-white' : 'text-deepBlue-700'}`}>
					{value || placeholder}
				</Text>
			</TouchableOpacity>

			<Modal
				transparent={true}
				visible={modalVisible}
				animationType="slide"
				onRequestClose={() => setModalVisible(false)}
			>
				<View className="flex-1 justify-end">
					<View className="bg-deepBlue-700 p-4 rounded-t-lg">
						<Text className="text-xl font-bold mb-4 text-white font-robotoBlack">Selecciona un emoji</Text>
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
							className="mt-4 p-3 bg-secondary-600 rounded-md items-center"
						>
							<Text className="text-white font-robotoBlack text-lg">Cancelar</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	)
}
