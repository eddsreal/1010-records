import * as schema from '@/common/hooks/database/schema'
import { PaymentMethod } from '@/common/hooks/database/schema'
import { usePaymentMethodsStore } from '@/stores/payment-methods.store'
import { eq, like } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
import { useEffect } from 'react'

const expoDb = openDatabaseSync('1010records')
const db = drizzle(expoDb)

interface PaymentMethodsFilter {
	isDeleted?: boolean
}

export function usePaymentMethods() {
	const { paymentMethods, refreshPaymentMethods } = usePaymentMethodsStore()

	useEffect(() => {
		getPaymentMethods()
	}, [refreshPaymentMethods])

	const getPaymentMethods = async (filter?: PaymentMethodsFilter) => {
		const paymentMethods = await db
			.select()
			.from(schema.paymentMethods)
			.where(filter?.isDeleted ? eq(schema.paymentMethods.isDeleted, filter.isDeleted) : undefined)
		usePaymentMethodsStore.setState({ paymentMethods, refreshPaymentMethods: false })
	}

	const createPaymentMethod = async (paymentMethod: PaymentMethod) => {
		await db.insert(schema.paymentMethods).values(paymentMethod)
		usePaymentMethodsStore.setState({ refreshPaymentMethods: true })
	}

	const updatePaymentMethod = async (paymentMethod: PaymentMethod) => {
		await db.update(schema.paymentMethods).set(paymentMethod).where(eq(schema.paymentMethods.id, paymentMethod.id))
		usePaymentMethodsStore.setState({ refreshPaymentMethods: true })
	}

	const deletePaymentMethod = async (paymentMethod: PaymentMethod) => {
		await updatePaymentMethod({
			...paymentMethod,
			isDeleted: true,
		})
		usePaymentMethodsStore.setState({ refreshPaymentMethods: true })
	}

	const getPaymentMethodByQuery = async (query: string) => {
		const paymentMethods = await db
			.select({
				id: schema.paymentMethods.id,
				name: schema.paymentMethods.name,
			})
			.from(schema.paymentMethods)
			.where(like(schema.paymentMethods.name, `%${query}%`))
		return paymentMethods
	}

	return {
		paymentMethods,
		createPaymentMethod,
		updatePaymentMethod,
		deletePaymentMethod,
		getPaymentMethodByQuery,
	}
}
