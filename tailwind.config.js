/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    fontFamily: {
      robotoBlack: ['Roboto_900Black'],
      robotoBold: ['Roboto_700Bold'],
      robotoMedium: ['Roboto_500Medium'],
      robotoRegular: ['Roboto_400Regular'],
      robotoLight: ['Roboto_300Light'],
      robotoThin: ['Roboto_100Thin'],
    },
    extend: {
      colors: {
        primary: {
          hover: '#26E89E',
          pressed: '#00A566',
          50: '#E6FFF5',
          100: '#CCFFEB',
          200: '#99FFD6',
          300: '#66FFC2',
          400: '#33FFAD',
          500: '#00e490',
          600: '#00B373',
          700: '#008256',
          800: '#005239',
          900: '#00291D'
        },
        secondary: {
          hover: '#FF5248',
          pressed: '#E0352B',
          50: '#FFEBEA',
          100: '#FFD6D4',
          200: '#FFADA9',
          300: '#FF847F',
          400: '#FF5B54',
          500: '#FF3B30',
          600: '#CC2F26',
          700: '#99231C',
          800: '#661813',
          900: '#330C09'
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121'
        },
        deepBlue: {
          hover: '#2E376D',
          pressed: '#1A2153',
          50: '#E8EAF6',
          100: '#C5CAE9',
          200: '#9FA8DA',
          300: '#7986CB',
          400: '#5C6BC0',
          500: '#232B5D',
          600: '#1E2550',
          700: '#191F43',
          800: '#141936',
          900: '#0F1329',
        },
        accent: '#3F51B5',
        text: {
          primary: '#FFFFFF',
          secondary: '#C5CAE9',
          tertiary: '#9FA8DA'
        },
        "app-gray": "#262626",
      },
    },
  },
	plugins: [],
}
