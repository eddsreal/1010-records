import { Account } from "@/database/schema";
import { create } from "zustand";

type AccountsStoreType = {
  accounts: Account[];
  refreshAccounts: boolean;
};

export const useAccountsStore = create<AccountsStoreType>()((set) => ({
  accounts: [],
  refreshAccounts: false,
}));
