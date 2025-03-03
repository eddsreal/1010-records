import { TransactionFormTypeEnum } from "@/common/enums/transactions.enum";
import { create } from "zustand";
import { PriorityWithCategories } from "./priorities.store";

type TransactionsStoreType = {
  mode: TransactionFormTypeEnum;
  newTransaction: {
    selectedPriority: PriorityWithCategories | null;
    reset: () => void;
  };
};

export const useTransactionsStore = create<TransactionsStoreType>()(
  (set, get) => ({
    mode: TransactionFormTypeEnum.FAST,
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
  })
);
