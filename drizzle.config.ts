import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	dialect: 'sqlite',
	driver: 'expo',
	schema: './common/hooks/database/schema.ts',
	out: './drizzle',
})
