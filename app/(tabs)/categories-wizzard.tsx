import { Category, Priority } from "@/common/interfaces/priorities.interfaces";
import { colors } from "@/common/styles/colors.styles";
import { inputStyles } from "@/common/styles/input.styles";
import { usePrioritiesStore } from "@/stores/priorities.store";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import { TextField } from "react-native-ui-lib";

export const CategoryElement: React.FunctionComponent<{
  category: Category;
  priority: Priority;
  isSuggested?: boolean;
}> = ({ category, priority, isSuggested = false }) => {
  const isSaved = priority.categories.some(
    (innerCategory) => innerCategory.id === category.id,
  );
  return (
    <View
      key={category.id}
      className={`flex-row justify-between items-center ${
        isSuggested ? "p-1" : "p-4"
      }`}
    >
      <View>
        <Text
          className={`font-bold text-app-gray ${
            isSuggested ? "text-gray-400 italic" : "text-xl"
          }`}
        >
          {category.name}
        </Text>
      </View>
      <View className="flex-row gap-4">
        {!isSaved && (
          <Ionicons
            name="save"
            size={25}
            color="gray"
            onPress={() =>
              usePrioritiesStore.setState({
                categories: [...priority.categories, category],
              })
            }
          />
        )}
        {isSaved && (
          <View className="flex-row gap-4">
            <Ionicons name="create" size={25} color="gray" />
            <Ionicons
              name="close-circle"
              size={25}
              color={colors.secondary}
              onPress={() => {
                usePrioritiesStore.setState({
                  categories: priority.categories.filter(
                    (innerCategory) => innerCategory.id !== category.id,
                  ),
                });
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export const PriorityElement: React.FunctionComponent<{
  priority: Priority;
}> = ({ priority }) => {
  const { categoryId, priorities } = usePrioritiesStore();
  const { control, getValues, handleSubmit, reset } = useForm();

  const onSubmit = () => {
    const value = getValues("category");

    const categories = [
      ...priority.categories,
      {
        id: categoryId,
        name: value,
        description: value,
        icon: "icon",
        color: "red",
        priorityId: priority.id,
      },
    ];

    const innerPriorities = priorities.map((innerPriority) => {
      if (innerPriority.id === priority.id) {
        return { ...innerPriority, categories };
      }
      return innerPriority;
    });

    usePrioritiesStore.setState({
      priorities: innerPriorities,
      categoryId: categoryId + 1,
    });
    reset();
  };

  return (
    <View key={priority.id} className="p-4">
      <Text className="text-3xl font-bold text-primary">{priority.name}</Text>
      <Text className="text-sm text-app-gray">{priority.description}</Text>

      <View className="mt-4">
        <Text className="text-xl leading-none font-bold text-primary">
          Categorias sugeridas
        </Text>
        {priority.suggestedCategories?.map((category) => (
          <CategoryElement
            category={category}
            key={category.id}
            priority={priority}
            isSuggested={true}
          />
        ))}
      </View>

      <View className="mt-4">
        <Text className="text-xl leading-none font-bold text-primary">
          Categorias Creadas
        </Text>
        {priority.categories?.map((category) => (
          <CategoryElement
            category={category}
            key={category.id}
            priority={priority}
          />
        ))}
      </View>

      <View className="mt-16">
        <Text className="text-xl leading-none font-bold text-secondary">
          Agregar nueva categoria
        </Text>
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder={"Nombre de Categoria"}
              floatingPlaceholder
              containerStyle={inputStyles.containerStyle}
              fieldStyle={inputStyles.fieldStyle}
            />
          )}
        />
        <Pressable
          onPress={handleSubmit(onSubmit)}
          className="bg-primary rounded-2xl p-4"
        >
          <Text className="text-white text-lg font-bold">Guardar</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default function CategoriesWizzardView() {
  const { priorities } = usePrioritiesStore();
  return (
    <View className="flex-1 bg-white">
      <PagerView initialPage={0} style={{ flex: 1 }}>
        {priorities.map((priority) => (
          <PriorityElement key={priority.id} priority={priority} />
        ))}
      </PagerView>
    </View>
  );
}
