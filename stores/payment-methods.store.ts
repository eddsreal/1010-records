import { PaymentMethod } from '@/common/hooks/database/schema'
import { create } from 'zustand'

type PaymentMethodsStoreType = {
	paymentMethods: PaymentMethod[]
	refreshPaymentMethods: boolean
}

export const usePaymentMethodsStore = create<PaymentMethodsStoreType>()((set) => ({
	paymentMethods: [],
	refreshPaymentMethods: false,
}))
