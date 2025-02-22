import { TransactionFormTypeEnum } from "@/common/enums/transactions.enum";
import { Priority } from "@/common/interfaces/priorities.interfaces";
import { create } from "zustand";

type TransactionsStoreType = {
  mode: TransactionFormTypeEnum;
  newTransaction: {
    selectedPriority: Priority | null;
  };
};

export const useTransactionsStore = create<TransactionsStoreType>()((set) => ({
  mode: TransactionFormTypeEnum.FAST,
  newTransaction: {
    selectedPriority: null,
  },
}));
