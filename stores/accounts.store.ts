import { Account } from "@/database/schema";
import { create } from "zustand";

type AccountsStoreType = {
  accounts: Account[];
};

export const useAccountsStore = create<AccountsStoreType>()((set) => ({
  accounts: [],
}));
