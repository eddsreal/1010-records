import { useAccounts } from '@/common/hooks/database/use-accounts.hook'
import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { usePriorities } from '@/common/hooks/database/use-priorities.hook'
import { useAccountsStore } from '@/stores/accounts.store'
import { useForecastsStore } from '@/stores/forecasts.store'
import { usePrioritiesStore } from '@/stores/priorities.store'
import {
	Roboto_100Thin,
	Roboto_300Light,
	Roboto_400Regular,
	Roboto_500Medium,
	Roboto_700Bold,
	Roboto_900Black,
	useFonts,
} from '@expo-google-fonts/roboto'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { openDatabaseSync } from 'expo-sqlite'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../global.css'
const expoDb = openDatabaseSync('1010records')
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
	useDrizzleStudio(expoDb)
	usePriorities()
	useForecasts()
	useAccounts()
	const [loaded, error] = useFonts({
		Roboto_900Black,
		Roboto_700Bold,
		Roboto_500Medium,
		Roboto_400Regular,
		Roboto_300Light,
		Roboto_100Thin,
	})

	useEffect(() => {
		if (loaded || error) {
			SplashScreen.hideAsync()
		}
	}, [loaded, error])

	useEffect(() => {
		usePrioritiesStore.setState({ refreshPriorities: true })
		useForecastsStore.setState({ refreshForecasts: true })
		useAccountsStore.setState({ refreshAccounts: true })
	}, [])

	if (!loaded && !error) {
		return null
	}

	return (
		<SafeAreaProvider>
			<Slot />
			<StatusBar style="light" />
		</SafeAreaProvider>
	)
}
