import { menuItems } from '@/common/menu'
import { useMenuStore } from '@/stores/menu.store'
import { router } from 'expo-router'
import { FlatList, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Menu() {
	const insets = useSafeAreaInsets()
	const { currentRoute } = useMenuStore()

	return (
		<View className="flex-1 bg-deepBlue-800" style={{ paddingTop: insets.top }}>
			<FlatList
				data={menuItems}
				renderItem={({ item }) => {
					const isActive = currentRoute === item.href
					return (
						<Pressable
							onPress={() => {
								useMenuStore.setState({ currentRoute: item.href })
								router.push(item.href)
							}}
							className={`p-4 ${isActive ? 'bg-deepBlue-600' : ''}`}
						>
							<Text
								className={` text-2xl ${isActive ? 'font-robotoBold text-primary-500' : 'text-white font-robotoRegular'}`}
							>
								{item.label}
							</Text>
						</Pressable>
					)
				}}
			/>
		</View>
	)
}
