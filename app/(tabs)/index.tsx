import {
  TransactionStatusEnum,
  TransactionTypeEnum,
} from "@/common/enums/transactions.enum";
import { useCurrency } from "@/common/hooks/use-currency.hook";
import * as schema from "@/database/schema";
import { usePrioritiesStore } from "@/stores/priorities.store";
import { useTransactionsStore } from "@/stores/transactions.store";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);

export default function DashboardView() {
  const insets = useSafeAreaInsets();
  const { pendingTransactions, newTransaction, latestTransactions } =
    useTransactionsStore();
  const { priorities } = usePrioritiesStore();
  const { formatToCurrency } = useCurrency();

  const getPendingTransactions = async () => {
    const transactions = await db
      .select()
      .from(schema.transaction)
      .where(eq(schema.transaction.status, TransactionStatusEnum.PENDING));

    useTransactionsStore.setState({ pendingTransactions: transactions });
  };

  const getLatestTransactions = async () => {
    const transactions = await db
      .select()
      .from(schema.transaction)
      .where(eq(schema.transaction.status, TransactionStatusEnum.COMPLETED))
      .orderBy(desc(schema.transaction.createdAt))
      .limit(5);

    useTransactionsStore.setState({ latestTransactions: transactions });
  };

  useEffect(() => {
    getPendingTransactions();
    getLatestTransactions();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <Text className="text-2xl font-bold">Transacciones pendientes</Text>
      {pendingTransactions.map((transaction) => (
        <TouchableOpacity
          key={transaction.id}
          className="flex-row justify-between items-center gap-4 p-4"
          onPress={() => {
            useTransactionsStore.setState({ editTransaction: transaction });

            if (transaction.priorityId) {
              const innerSelectedPriority = priorities.find(
                (priority) => priority.id === transaction.priorityId,
              );

              if (innerSelectedPriority) {
                useTransactionsStore.setState({
                  newTransaction: {
                    ...newTransaction,
                    selectedPriority: innerSelectedPriority,
                  },
                });
              }
            }
            router.push("/new-transaction");
          }}
        >
          <Text className="text-gray-500">
            {transaction.createdAt.toLocaleString()}
          </Text>
          <Text className="text-gray-500">
            {transaction.type === TransactionTypeEnum.INCOME
              ? "Entrada"
              : "Salida"}
            <Text className="text-lg font-bold">
              {formatToCurrency(transaction.amount)}
            </Text>
          </Text>
        </TouchableOpacity>
      ))}

      <Text className="text-2xl font-bold">Últimas transacciones</Text>
      {latestTransactions.map((transaction) => {
        const priority = priorities.find(
          (p) => p.id === transaction.priorityId,
        );
        const category = priority?.categories.find(
          (c) => c.id === transaction.categoryId,
        );
        return (
          <View
            key={transaction.id}
            className="flex-row justify-between items-center gap-4 p-4"
          >
            <Text>{transaction.createdAt.toLocaleDateString()}</Text>
            <Text>{priority?.name}</Text>
            <Text>{category?.name}</Text>
            <View className="flex-row items-center gap-2">
              <Text>
                {transaction.type === TransactionTypeEnum.INCOME
                  ? "Entrada"
                  : "Salida"}
              </Text>
              <Text className="text-lg font-bold">
                {formatToCurrency(transaction.amount)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
