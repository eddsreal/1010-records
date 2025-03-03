import { TransactionFormTypeEnum } from "@/common/enums/transactions.enum";
import { Transaction } from "@/database/schema";
import { create } from "zustand";
import { PriorityWithCategories } from "./priorities.store";

type TransactionsStoreType = {
  mode: TransactionFormTypeEnum;
  newTransaction: {
    selectedPriority: PriorityWithCategories | null;
    reset: () => void;
  };
  pendingTransactions: Transaction[];
  editTransaction: Transaction | undefined;
  latestTransactions: Transaction[];
};

export const useTransactionsStore = create<TransactionsStoreType>()(
  (set, get) => ({
    mode: TransactionFormTypeEnum.FAST,
    pendingTransactions: [],
    editTransaction: undefined,
    newTransaction: {
      selectedPriority: null,
      reset: () => {
        set({
          mode: TransactionFormTypeEnum.FAST,
          newTransaction: {
            ...get().newTransaction,
            selectedPriority: null,
          },
        });
      },
    },
    latestTransactions: [],
  })
);
