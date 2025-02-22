import { TransactionFormTypeEnum } from "@/common/enums/transactions.enum";
import { Priority } from "@/common/interfaces/priorities.interfaces";
import { create } from "zustand";

type TransactionsStoreType = {
  mode: TransactionFormTypeEnum;
  newTransaction: {
    selectedPriority: Priority | null;
    reset?: () => void;
  };
};

export const useTransactionsStore = create<TransactionsStoreType>()(
  (set, get) => ({
    mode: TransactionFormTypeEnum.FAST,
    newTransaction: {
      selectedPriority: null,
      reset: () => {
        set({
          newTransaction: {
            ...get().newTransaction,
            selectedPriority: null,
          },
        });
      },
    },
  })
);
