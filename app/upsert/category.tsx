import { Category } from '@/common/hooks/database/schema'
import { usePriorities } from '@/common/hooks/database/use-priorities.hook'
import { colors } from '@/common/styles/colors.styles'
import { EmojiPicker } from '@/components/atoms/emoji-picker.atom'
import { PriorityWithCategories, usePrioritiesStore } from '@/stores/priorities.store'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface FormData {
	name: string
	description: string
	icon: string
}

const PriorityElement: React.FC<{ priority: PriorityWithCategories }> = ({ priority }) => {
	const [isAddingCategory, setIsAddingCategory] = useState(false)
	const { control, handleSubmit, reset } = useForm<FormData>({
		defaultValues: {
			name: '',
			description: '',
			icon: '',
		},
	})
	const { createCategory } = usePriorities()
	const { editCategory } = usePrioritiesStore()

	const onSubmit = async (data: FormData) => {
		await createCategory({
			name: data.name,
			description: data.description,
			categoryType: priority.priorityType,
			icon: data.icon,
			color: '#000000',
			priorityId: priority.id,
			isDeleted: false,
			id: editCategory?.id,
		} as Category)
		reset({
			name: '',
			description: '',
			icon: '',
		})
		usePrioritiesStore.setState({ editCategory: null, refreshPriorities: true })
		setIsAddingCategory(false)
	}

	return (
		<View className="flex-1">
			<View className="flex-row items-center justify-around gap-2 mb-4">
				<Text
					style={{ color: priority.color ? priority.color : colors.secondary }}
					className="text-white text-3xl font-bold"
				>
					{priority.name}
				</Text>
				<Pressable
					style={{ backgroundColor: priority.color ? priority.color : colors.secondary }}
					className="p-2 rounded-md"
					onPress={() => {
						setIsAddingCategory(!isAddingCategory)
					}}
				>
					<MaterialIcons name="add" size={24} color="white" />
				</Pressable>
			</View>
			<View className="flex-1">
				{priority.categories?.map((category) => (
					<View key={category.id} className="flex-row justify-between items-center p-4">
						<Text className="text-white text-2xl font-bold">
							{category.icon} {category.name}
						</Text>
						<View className="flex-row items-center gap-2">
							<Pressable
								onPress={() => {
									setIsAddingCategory(true)
									usePrioritiesStore.setState({ editCategory: category })
									reset({
										name: category.name,
										description: category.description ?? '',
										icon: category.icon ?? '',
									})
								}}
							>
								<MaterialIcons name="edit" size={32} color="white" />
							</Pressable>
							<Pressable
								onPress={() => {
									setIsAddingCategory(true)
								}}
							>
								<MaterialIcons name="delete" size={32} color="white" />
							</Pressable>
						</View>
					</View>
				))}
			</View>

			{isAddingCategory && (
				<View className="mt-4 flex-col gap-4">
					<Text className="text-primary-500 text-lg font-bold mb-4">Agregar categoría</Text>
					<Controller
						control={control}
						name="name"
						render={({ field }) => (
							<TextInput
								placeholder="Nombre de la categoría"
								className="p-4 w-full bg-deepBlue-600 rounded-lg text-white text-2xl font-robotoBlack placeholder:text-deepBlue-700"
								onChangeText={field.onChange}
								onBlur={field.onBlur}
								value={field.value}
							/>
						)}
					/>
					<Controller
						control={control}
						name="description"
						render={({ field }) => (
							<TextInput
								placeholder="Descripción de la categoría"
								className="p-4 w-full bg-deepBlue-600 rounded-lg text-white text-2xl font-robotoBlack placeholder:text-deepBlue-700"
								onChangeText={field.onChange}
								onBlur={field.onBlur}
								value={field.value}
							/>
						)}
					/>
					<Controller
						control={control}
						name="icon"
						render={({ field }) => (
							<EmojiPicker value={field.value} onChange={field.onChange} placeholder="Icono de la categoría" />
						)}
					/>
					<Pressable
						style={{ backgroundColor: priority.color ? priority.color : colors.secondary }}
						className="p-4 rounded-md"
						onPress={handleSubmit(onSubmit)}
					>
						<Text className="text-white text-lg font-bold">Agregar categoría</Text>
					</Pressable>
				</View>
			)}
		</View>
	)
}

export default function UpsertCategory() {
	const insets = useSafeAreaInsets()
	const [currentPage, setCurrentPage] = useState(0)

	const { priorities } = usePrioritiesStore()

	return (
		<View className="bg-deepBlue-800 h-full p-4" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<View className="flex-row justify-between items-center gap-2 p-2 mb-8">
				<View className="flex-row items-center gap-2">
					<Text className="text-white text-5xl font-bold">Categorías</Text>
				</View>
				<Pressable
					onPress={() => {
						router.push('/')
					}}
				>
					<MaterialIcons name="close" size={24} color="white" />
				</Pressable>
			</View>

			<PagerView
				initialPage={0}
				style={{ flex: 1 }}
				onPageSelected={(e) => {
					setCurrentPage(e.nativeEvent.position)
				}}
			>
				{priorities.map((priority) => (
					<PriorityElement key={priority.id} priority={priority} />
				))}
			</PagerView>
			<View className="flex-row justify-center items-center gap-2 p-2">
				{priorities.map((priority, index) => {
					const isActive = index === currentPage
					return (
						<TouchableOpacity
							key={priority.id}
							className={`w-3 h-3 bg-primary-500 rounded-full ${isActive ? 'opacity-100' : 'opacity-20'}`}
						/>
					)
				})}
			</View>
		</View>
	)
}
