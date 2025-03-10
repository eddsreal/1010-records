import { Account } from "@/common/hooks/database/schema";
import { useAccounts } from "@/common/hooks/database/use-accounts.hook";
import { inputStyles } from "@/common/styles/input.styles";
import { CurrencyMaskedInput } from "@/components/atoms/currency-masked-input.atom";
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
  const { createAccount } = useAccounts();
  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      name: "",
      description: "",
      balance: "0",
    },
  });

  const onSubmit = async (data: FormValues) => {
    await createAccount({
      name: data.name,
      description: data.description,
      balance: parseFloat(data.balance),
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    } as Account);

    router.push("/accounts");
    reset();
  };

  return (
    <View className="bg-white h-full p-4">
      <Text className="text-secondary text-5xl font-bold">Crear Cuenta</Text>

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
          />
        )}
      />

      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CurrencyMaskedInput
            label={"Balance"}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value?.toString()}
            placeholder={"Ingrese un monto"}
            style={{
              ...inputStyles.fieldStyle,
            }}
          />
        )}
        name="balance"
      />

      <View className="flex-row justify-around items-center">
        <Pressable
          className="bg-secondary rounded-full py-4 px-8"
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
