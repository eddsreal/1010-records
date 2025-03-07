import { useCurrency } from "@/common/hooks/utilities/use-currency.hook";
import { useAccountsStore } from "@/stores/accounts.store";
import { router } from "expo-router";
import { useEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

export default function AccountsView() {
  const { accounts } = useAccountsStore();
  const { formatToCurrency } = useCurrency();

  useEffect(() => {
    useAccountsStore.setState({ refreshAccounts: true });
  }, []);

  return (
    <View className="bg-white h-full p-4">
      <Text className="text-primary text-5xl font-bold">Cuentas</Text>

      <FlatList
        data={accounts}
        renderItem={({ item }) => (
          <View className="bg-gray-100 rounded-lg p-4 mb-4">
            <Text className="text-primary text-xl font-bold">{item.name}</Text>
            <Text className="text-gray-500 text-sm">{item.description}</Text>
            <Text className="text-gray-500 text-sm">
              {formatToCurrency(item.balance)}
            </Text>
          </View>
        )}
      />

      <View className="flex-row justify-between items-center">
        <Pressable
          className="bg-primary rounded-full py-4 px-8"
          onPress={() => router.push("/new-account")}
        >
          <Text className="text-white text-xl font-bold">Agregar cuenta</Text>
        </Pressable>
      </View>
    </View>
  );
}
