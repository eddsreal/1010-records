import * as schema from '@/common/hooks/database/schema'
import { Account } from '@/common/hooks/database/schema'
import { useAccountsStore } from '@/stores/accounts.store'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
import { useEffect } from 'react'

const expoDb = openDatabaseSync('1010records')
const db = drizzle(expoDb)

interface AccountsFilter {
	isDeleted?: boolean
}

export function useAccounts() {
	const { accounts, refreshAccounts } = useAccountsStore()

	useEffect(() => {
		getAccounts()
	}, [refreshAccounts])

	const getAccounts = async (filter?: AccountsFilter) => {
		const accounts = await db
			.select()
			.from(schema.accounts)
			.where(filter?.isDeleted ? eq(schema.accounts.isDeleted, filter.isDeleted) : undefined)
		useAccountsStore.setState({ accounts, refreshAccounts: false })
	}

	const createAccount = async (account: Account) => {
		await db.insert(schema.accounts).values(account)
		useAccountsStore.setState({ refreshAccounts: true })
	}

	const updateAccount = async (account: Account) => {
		await db.update(schema.accounts).set(account).where(eq(schema.accounts.id, account.id))
		useAccountsStore.setState({ refreshAccounts: true })
	}

	const deleteAccount = async (account: Account) => {
		await updateAccount({
			...account,
			isDeleted: true,
		})
		useAccountsStore.setState({ refreshAccounts: true })
	}

	return {
		accounts,
		createAccount,
		updateAccount,
		deleteAccount,
	}
}
