import { usePriorities } from '@/common/hooks/database/use-priorities.hook'
import { inputStyles } from '@/common/styles/input.styles'
import { Category } from '@/database/schema'
import { PriorityWithCategories, usePrioritiesStore } from '@/stores/priorities.store'
import { Controller, useForm } from 'react-hook-form'
import { Pressable, Text, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { TextField } from 'react-native-ui-lib'

export const CategoryElement: React.FunctionComponent<{
	category: Category
	priority: PriorityWithCategories
	isSuggested?: boolean
}> = ({ category, priority, isSuggested = false }) => {
	return (
		<View key={category.id} className={`flex-row justify-between items-center ${isSuggested ? 'p-1' : 'p-4'}`}>
			<View>
				<Text className={`font-bold text-app-gray ${isSuggested ? 'text-gray-400 italic' : 'text-xl'}`}>
					{category.name}
				</Text>
			</View>
		</View>
	)
}

export const PriorityElement: React.FunctionComponent<{
	priority: PriorityWithCategories
}> = ({ priority }) => {
	const { createCategory } = usePriorities()
	const { control, getValues, handleSubmit, reset } = useForm()

	const onSubmit = async () => {
		const value = getValues('category')

		await createCategory({
			name: value,
			description: value,
			icon: '💰',
			color: '#000000',
			priorityId: priority.id,
			createdAt: new Date(),
			updatedAt: new Date(),
			isDeleted: false,
			accountId: null,
		} as Category)

		usePrioritiesStore.setState({ refreshPriorities: true })

		reset()
	}

	return (
		<View key={priority.id} className="p-4">
			<Text className="text-3xl font-bold text-primary">{priority.name}</Text>
			<Text className="text-sm text-app-gray">{priority.description}</Text>

			<View className="mt-4">
				<Text className="text-xl leading-none font-bold text-primary">Categorias Creadas</Text>
				{priority.categories?.map((category: Category) => (
					<CategoryElement category={category} key={category.id} priority={priority} />
				))}
			</View>

			<View className="mt-16">
				<Text className="text-xl leading-none font-bold text-secondary">Agregar nueva categoria</Text>
				<Controller
					control={control}
					name="category"
					render={({ field: { onChange, onBlur, value } }) => (
						<TextField
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							placeholder={'Nombre de Categoria'}
							floatingPlaceholder
							fieldStyle={inputStyles.fieldStyle}
						/>
					)}
				/>
				<Pressable onPress={handleSubmit(onSubmit)} className="bg-primary rounded-2xl p-4">
					<Text className="text-white text-lg font-bold">Guardar</Text>
				</Pressable>
			</View>
		</View>
	)
}

export default function CategoriesWizzardView() {
	const { priorities } = usePrioritiesStore()
	return (
		<View className="flex-1 bg-white">
			<PagerView initialPage={0} style={{ flex: 1 }}>
				{priorities.map((priority) => (
					<PriorityElement key={priority.id} priority={priority} />
				))}
			</PagerView>
		</View>
	)
}
