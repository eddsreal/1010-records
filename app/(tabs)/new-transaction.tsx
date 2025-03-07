import { router } from 'expo-router'
import React, { useCallback, useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { ScrollView, Text, View } from 'react-native'

import { TransactionFormTypeEnum, TransactionTypeEnum } from '@/common/enums/transactions.enum'

import { usePrioritiesStore } from '@/stores/priorities.store'
import { useTransactionsStore } from '@/stores/transactions.store'

import { inputStyles } from '@/common/styles/input.styles'

import { useTransactions } from '@/common/hooks/database/use-transactions.hook'
import { CurrencyMaskedInput } from '@/components/atoms/currency-masked-input.atom'
import { AccountSelector } from '@/components/organisms/transaction/account-selector.organism'
import { ActionButtons } from '@/components/organisms/transaction/action-buttons.organism'
import { ForecastComparison } from '@/components/organisms/transaction/forecast-comparison.organism'
import { FormHeader } from '@/components/organisms/transaction/form-header.organism'
import { MovementTypeSelector } from '@/components/organisms/transaction/movement-type-selector.organism'
import { PrioritySelector } from '@/components/organisms/transaction/priority-selector.organism'
import { Transaction } from '@/database/schema'

export interface TransactionFormValues {
	amount: number
	currency: string
	type: TransactionTypeEnum
	account: number
	priority: number
	category: number
}

export default function NewTransactionView() {
	const { mode, editTransaction, newTransaction } = useTransactionsStore()
	const { priorities } = usePrioritiesStore()
	const { createTransaction } = useTransactions()

	const methods = useForm<TransactionFormValues>({
		mode: 'all',
		defaultValues: {
			type: TransactionTypeEnum.EXPENSE,
			account: undefined,
			priority: undefined,
			category: undefined,
		},
	})

	const type = methods.watch('type')
	const amount = methods.watch('amount')
	const category = methods.watch('category')
	const isIncome = type === TransactionTypeEnum.INCOME

	const isCompleteMode = mode === TransactionFormTypeEnum.COMPLETE

	const setTransactionValues = useCallback(() => {
		if (!editTransaction) return

		useTransactionsStore.setState({
			mode: TransactionFormTypeEnum.COMPLETE,
		})

		methods.setValue('amount', editTransaction.amount)
		methods.setValue('type', editTransaction.type as TransactionTypeEnum)

		if (editTransaction.accountId) {
			methods.setValue('account', editTransaction.accountId)
		}

		if (editTransaction.categoryId) {
			methods.setValue('category', editTransaction.categoryId)
		}

		if (editTransaction.priorityId) {
			const selectedPriority = priorities.find((priority) => priority.id === editTransaction.priorityId)

			if (selectedPriority) {
				useTransactionsStore.setState({
					newTransaction: {
						...newTransaction,
						selectedPriority,
					},
				})
			}
		}
	}, [editTransaction, priorities, newTransaction, methods.setValue])

	useEffect(() => {
		if (editTransaction) {
			setTransactionValues()
		}
	}, [editTransaction, setTransactionValues])

	const onSubmit = async (data: TransactionFormValues) => {
		await createTransaction({
			amount: data.amount,
			type: data.type,
			accountId: data.account,
			categoryId: data.category,
			priorityId: data.priority,
		} as Transaction)

		router.push('/')
	}

	return (
		<ScrollView className="p-4 bg-white">
			<FormProvider {...methods}>
				<Text className="text-primary text-5xl font-bold mb-4">Registro de transacción</Text>

				<FormHeader />

				<View>
					<MovementTypeSelector isIncome={isIncome} />

					<Controller
						control={methods.control}
						rules={{ required: true }}
						render={({ field: { onChange, onBlur, value } }) => (
							<CurrencyMaskedInput
								label="Monto"
								onChangeText={onChange}
								onBlur={onBlur}
								value={value?.toString()}
								placeholder="Ingrese un monto"
								style={{
									...inputStyles.fieldStyle,
								}}
							/>
						)}
						name="amount"
					/>

					{isCompleteMode && <AccountSelector />}

					{isCompleteMode && !isIncome && <PrioritySelector />}

					{isCompleteMode && !isIncome && category && newTransaction.selectedPriority && amount > 0 && (
						<ForecastComparison />
					)}

					<ActionButtons onSubmit={onSubmit} />
				</View>
			</FormProvider>
		</ScrollView>
	)
}
