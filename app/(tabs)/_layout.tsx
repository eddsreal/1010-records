import { useAccounts } from '@/common/hooks/database/use-accounts.hook'
import { usePriorities } from '@/common/hooks/database/use-priorities.hook'
import { useTransactions } from '@/common/hooks/database/use-transactions.hook'
import { colors } from '@/common/styles/colors.styles'
import migrations from '@/drizzle/migrations'
import { useAccountsStore } from '@/stores/accounts.store'
import { usePrioritiesStore } from '@/stores/priorities.store'
import { useTransactionsStore } from '@/stores/transactions.store'
import { Ionicons } from '@expo/vector-icons'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { router, Tabs, usePathname } from 'expo-router'
import { openDatabaseSync } from 'expo-sqlite'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../../global.css'
const expoDb = openDatabaseSync('1010records')
const db = drizzle(expoDb)

export default function TabLayout() {
	const { success, error } = useMigrations(db, migrations)
	useAccounts()
	usePriorities()
	useTransactions()
	
	const pathname = usePathname()
	const shouldHideElement = pathname.includes('edit') || pathname.includes('new')

	useEffect(() => {
		useAccountsStore.setState({ refreshAccounts: true })
		usePrioritiesStore.setState({ refreshPriorities: true })
		useTransactionsStore.setState({ refreshTransactions: true })
	}, [success])

	if (error) {
		console.log(error)
		return (
			<View>
				<Text>Migration error: {error.message}</Text>
			</View>
		)
	}
	if (!success) {
		return (
			<View>
				<Text>Migration is in progress...</Text>
			</View>
		)
	}

	return (
		<SafeAreaProvider>
			<Tabs
				screenOptions={({ route }) => {
					const hideTabBar = route.name.includes('edit') || route.name.includes('new')
					return {
						headerShown: false,
						tabBarActiveTintColor: colors.primary,
						tabBarStyle: {
							display: hideTabBar ? 'none' : 'flex',
						},
					}
				}}
			>
				<Tabs.Screen
					name="index"
					options={{
						title: 'Inicio',
						tabBarIcon: ({ color, size }) => <Ionicons name="home-sharp" color={color} size={size} />,
					}}
				/>
				<Tabs.Screen
					name="accounts"
					options={{
						title: 'Cuentas',
						tabBarIcon: ({ color, size }) => <Ionicons name="card-sharp" color={color} size={size} />,
					}}
				/>
				<Tabs.Screen
					name="forecast"
					options={{
						title: 'Presupuesto',
						tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-sharp" color={color} size={size} />,
					}}
				/>
				<Tabs.Screen
					name="new-transaction"
					options={{
						href: null,
					}}
				/>
				<Tabs.Screen
					name="new-account"
					options={{
						href: null,
					}}
				/>
				<Tabs.Screen
					name="categories-wizzard"
					options={{
						href: null,
					}}
				/>
				<Tabs.Screen
					name="edit-forecast-element"
					options={{
						href: null,
					}}
				/>
			</Tabs>
			<StatusBar style="dark" />
			{!shouldHideElement && (
				<View>
					<Pressable
						className="bg-primary rounded-full w-16 h-16 items-center justify-center absolute bottom-16 right-4"
						onPress={() => router.push('/new-transaction')}
					>
						<Text className="text-white text-4xl font-bold">+</Text>
					</Pressable>
				</View>
			)}
		</SafeAreaProvider>
	)
}
