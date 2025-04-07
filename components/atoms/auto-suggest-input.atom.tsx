import { useEffect, useState } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export interface AutoSuggestItem {
	id: string | number
	name: string
	icon: string
	color?: string
	priorityId?: string | number
}

interface AutoSuggestInputProps {
	placeholder: string
	value: AutoSuggestItem | null
	onChange: (value: AutoSuggestItem) => void
	searchItems: (search: string) => Promise<AutoSuggestItem[]>
}

export const AutoSuggestInput: React.FC<AutoSuggestInputProps> = ({ placeholder, value, onChange, searchItems }) => {
	const [showItems, setShowItems] = useState<boolean>(false)
	const [query, setQuery] = useState<string>('')
	const [items, setItems] = useState<AutoSuggestItem[]>([])
	const [isFocused, setIsFocused] = useState<boolean>(false)

	const handleChange = (text: string) => {
		setQuery(text)
		setShowItems(true)
		handleSearch(text)
	}

	useEffect(() => {
		handleSearch('')
		setShowItems(isFocused)
	}, [isFocused])

	useEffect(() => {
		if (value) {
			setQuery(`${value.icon} ${value.name}`)
			setShowItems(false)
		}
	}, [value])

	const handleSearch = async (search: string) => {
		const items = await searchItems(search)
		setItems(items)
	}

	return (
		<View className="flex-col w-full relative">
			<TextInput
				className="p-4 w-full bg-deepBlue-600 rounded-lg text-white text-2xl font-robotoBlack placeholder:text-deepBlue-700"
				placeholder={placeholder}
				value={query}
				onChangeText={handleChange}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
			/>
			{showItems && (
				<ScrollView 
					className="absolute top-[100%] w-full z-10"
					style={{ maxHeight: 144 }} // Equivalente a h-36
				>
					{items.map((item) => (
						<TouchableOpacity
							key={item.id}
							style={{ backgroundColor: item.color ? item.color : '#232B5D' }}
							className="p-4 w-full"
							onPress={() => onChange(item)}
						>
							<Text className="text-white text-lg font-robotoBlack">
								{item.icon} {item.name}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			)}
		</View>
	)
}
