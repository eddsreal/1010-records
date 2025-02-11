import { inputStyles } from "@/common/styles/input.styles";
import { CurrencyInputAtom } from "@/components/atoms/currency-input.atom";
import { useAccountsStore } from "@/stores/accounts.store";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { TextField } from "react-native-ui-lib";

interface FormValues {
  name: string;
  description: string;
  balance: string;
}

export default function NewAccount() {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      name: "",
      description: "",
      balance: "0",
    },
  });

  const { accounts, accountId } = useAccountsStore();

  const onSubmit = (data: FormValues) => {
    const newAccount = {
      id: accountId,
      name: data.name,
      description: data.description,
      balance: parseFloat(data.balance),
    };

    useAccountsStore.setState({
      accounts: [...accounts, newAccount],
      accountId: accountId + 1,
    });

    router.back();
    reset();
  };

  return (
    <View className="bg-white h-full p-4">
      <Text className="text-primary text-5xl font-bold">Crear Cuenta</Text>

      <Controller
        control={control}
        name="name"
        rules={{
          required: true,
        }}
        render={({ field }) => (
          <TextField
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            value={field.value}
            placeholder={"Nombre de cuenta"}
            placeholderClassName="text-gray-500"
            fieldStyle={inputStyles.fieldStyle}
            containerStyle={inputStyles.containerStyle}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextField
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            value={field.value}
            placeholder={"Descripción"}
            placeholderClassName="text-gray-500"
            fieldStyle={inputStyles.fieldStyle}
            containerStyle={inputStyles.containerStyle}
          />
        )}
      />

      <Controller
        control={control}
        name="balance"
        render={({ field }) => (
          <CurrencyInputAtom
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            placeholder={"Balance"}
            placeholderClassName="text-gray-500"
            containerStyle={inputStyles.containerStyle}
          />
        )}
      />

      <View className="flex-row justify-around items-center">
        <Pressable
          className="bg-primary rounded-full py-4 px-8"
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="text-white text-xl font-bold">Agregar cuenta</Text>
        </Pressable>
        <Pressable
          className="bg-red-500 rounded-full py-4 px-8"
          onPress={() => router.back()}
        >
          <Text className="text-white text-xl font-bold">Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}
