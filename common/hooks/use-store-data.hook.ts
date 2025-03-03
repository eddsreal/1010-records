import * as schema from "@/database/schema";
import { useAccountsStore } from "@/stores/accounts.store";
import {
  PriorityWithCategories,
  usePrioritiesStore,
} from "@/stores/priorities.store";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useCallback } from "react";

const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);

export function useStoreData() {
  const getAccounts = useCallback(async () => {
    const accounts = await db.select().from(schema.accounts);
    useAccountsStore.setState({ accounts });
  }, []);

  const getPriorities = useCallback(async () => {
    const prioritiesWithCategories = await db
      .select()
      .from(schema.priorities)
      .leftJoin(
        schema.categories,
        eq(schema.categories.priorityId, schema.priorities.id)
      )
      .then((results) => {
        const grouped = results.reduce(
          (acc, row) => {
            if (!acc[row.priorities.id]) {
              acc[row.priorities.id] = {
                ...row.priorities,
                categories: [],
              };
            }
            if (row.categories) {
              acc[row.priorities.id].categories.push(row.categories);
            }
            return acc;
          },
          {} as Record<number, PriorityWithCategories>
        );

        return Object.values(grouped);
      });

    usePrioritiesStore.setState({ priorities: prioritiesWithCategories });
  }, []);

  return {
    getAccounts,
    getPriorities,
    db,
  };
}
