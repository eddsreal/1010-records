import { Account } from "@/common/interfaces/accounts.interfaces";
import { create } from "zustand";

type AccountsStoreType = {
  accounts: Account[];
  accountId: number;
};

export const useAccountsStore = create<AccountsStoreType>()((set) => ({
  accounts: [],
  accountId: 1,
}));
