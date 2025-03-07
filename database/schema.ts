import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const accounts = sqliteTable('accounts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description'),
	balance: real('balance').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
})

export const priorities = sqliteTable('priorities', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description'),
	icon: text('icon'),
	color: text('color'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
})

export const categories = sqliteTable('categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description'),
	icon: text('icon'),
	color: text('color'),
	accountId: integer('account_id').references(() => accounts.id),
	priorityId: integer('priority_id').references(() => priorities.id),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
})

export const forecasts = sqliteTable('forecasts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	year: integer('year').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
})

export const forecastDetails = sqliteTable('forecast_details', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	amount: real('amount').notNull(),
	month: integer('month').notNull(),
	accountId: integer('account_id').references(() => accounts.id),
	priorityId: integer('priority_id').references(() => priorities.id),
	transactionType: text('transaction_type', {
		enum: ['INCOME', 'EXPENSE'],
	}).notNull(),
	forecastType: text('forecast_type', {
		enum: ['PROJECTED', 'EXECUTED'],
	}).notNull(),
	forecastId: integer('forecast_id')
		.notNull()
		.references(() => forecasts.id),
	categoryId: integer('category_id').references(() => categories.id),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
})

export const transactions = sqliteTable('transactions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	amount: real('amount').notNull(),
	description: text('description'),
	type: text('type', { enum: ['INCOME', 'EXPENSE'] }).notNull(),
	accountId: integer('account_id').references(() => accounts.id),
	priorityId: integer('priority_id').references(() => priorities.id),
	categoryId: integer('category_id').references(() => categories.id),
	status: text('status', { enum: ['PENDING', 'COMPLETED', 'CANCELLED'] })
		.notNull()
		.default('PENDING'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
})

export type Account = typeof accounts.$inferSelect
export type Priority = typeof priorities.$inferSelect
export type Category = typeof categories.$inferSelect
export type ForecastDetail = typeof forecastDetails.$inferSelect
export type Forecast = typeof forecasts.$inferSelect
export type Transaction = typeof transactions.$inferSelect
