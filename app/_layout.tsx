import { useAccounts } from '@/common/hooks/database/use-accounts.hook'
import { useForecasts } from '@/common/hooks/database/use-forecasts.hook'
import { usePriorities } from '@/common/hooks/database/use-priorities.hook'
import migrations from '@/drizzle/migrations'
import { useAccountsStore } from '@/stores/accounts.store'
import { useForecastsStore } from '@/stores/forecasts.store'
import { usePrioritiesStore } from '@/stores/priorities.store'
import { useTransactionsStore } from '@/stores/transactions.store'
import {
	Roboto_100Thin,
	Roboto_300Light,
	Roboto_400Regular,
	Roboto_500Medium,
	Roboto_700Bold,
	Roboto_900Black,
	useFonts,
} from '@expo-google-fonts/roboto'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { openDatabaseSync } from 'expo-sqlite'
import { StatusBar } from 'expo-status-bar'
import moment from 'moment'
import { useEffect } from 'react'
import { Text, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../global.css'
const expoDb = openDatabaseSync('1010records')
const db = drizzle(expoDb)
SplashScreen.preventAutoHideAsync()
moment.locale('es-CO', {
	months: 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split('_'),
	monthsShort: 'ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.'.split('_'),
	monthsParseExact: true,
	weekdays: 'domingo_lunes_martes_miércoles_jueves_viernes_sábado'.split('_'),
	weekdaysShort: 'dom._lun._mar._mié._jue._vie._sáb.'.split('_'),
	weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sá'.split('_'),
	weekdaysParseExact: true,
	longDateFormat: {
		LT: 'HH:mm',
		LTS: 'HH:mm:ss',
		L: 'DD/MM/YYYY',
		LL: 'D [de] MMMM [de] YYYY',
		LLL: 'D [de] MMMM [de] YYYY HH:mm',
		LLLL: 'dddd, D [de] MMMM [de] YYYY HH:mm',
	},
	calendar: {
		sameDay: '[Hoy a las] LT',
		nextDay: '[Mañana a las] LT',
		nextWeek: 'dddd [a las] LT',
		lastDay: '[Ayer a las] LT',
		lastWeek: 'dddd [pasado a las] LT',
		sameElse: 'L',
	},
	relativeTime: {
		future: 'en %s',
		past: 'hace %s',
		s: 'unos segundos',
		m: 'un minuto',
		mm: '%d minutos',
		h: 'una hora',
		hh: '%d horas',
		d: 'un día',
		dd: '%d días',
		M: 'un mes',
		MM: '%d meses',
		y: 'un año',
		yy: '%d años',
	},
	dayOfMonthOrdinalParse: /\d{1,2}º/,
	ordinal: (n: number) => `${n}º`,
	week: {
		dow: 1,
		doy: 4,
	},
})

export default function RootLayout() {
	useDrizzleStudio(expoDb)
	const { success, error } = useMigrations(db, migrations)
	usePriorities()
	useForecasts()
	useAccounts()
	const [loaded, errorFonts] = useFonts({
		Roboto_900Black,
		Roboto_700Bold,
		Roboto_500Medium,
		Roboto_400Regular,
		Roboto_300Light,
		Roboto_100Thin,
	})

	useEffect(() => {
		if (loaded || errorFonts) {
			SplashScreen.hideAsync()
		}
	}, [loaded, errorFonts])

	useEffect(() => {
		usePrioritiesStore.setState({ refreshPriorities: true })
		useForecastsStore.setState({ refreshForecasts: true })
		useAccountsStore.setState({ refreshAccounts: true })
		useTransactionsStore.setState({ refreshTransactions: true })
	}, [])

	if (!loaded && !errorFonts) {
		return null
	}

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
			<Slot />
			<StatusBar style="light" />
		</SafeAreaProvider>
	)
}
