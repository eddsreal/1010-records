import { inputStyles } from "@/common/styles/input.styles";
import { CurrencyMaskedInput } from "@/components/atoms/currency-masked-input.atom";
import * as schema from "@/database/schema";
import { useAccountsStore } from "@/stores/accounts.store";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { TextField } from "react-native-ui-lib";
interface FormValues {
  name: string;
  description: string;
  balance: string;
}

const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);

export default function NewAccount() {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      name: "",
      description: "",
      balance: "0",
    },
  });

  const onSubmit = async (data: FormValues) => {
    await db.insert(schema.accounts).values({
      name: data.name,
      description: data.description,
      balance: parseFloat(data.balance),
    });

    const newAccounts = await db.select().from(schema.accounts);
    useAccountsStore.setState({ accounts: newAccounts });

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
