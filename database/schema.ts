import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  balance: real("balance").notNull(),
});

export const priorities = sqliteTable("priorities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  priorityId: integer("priority_id").references(() => priorities.id),
});

export const forecastDetail = sqliteTable("forecast_detail", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: real("amount").notNull(),
  month: integer("month").notNull(),
  accountId: integer("account_id").references(() => accounts.id),
  priorityId: integer("priority_id").references(() => priorities.id),
  transactionType: text("transaction_type"),
  forecastType: text("forecast_type"),
  forecastId: integer("forecast_id").references(() => forecast.id),
  categoryId: integer("category_id").references(() => categories.id),
});

export const forecast = sqliteTable("forecasts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  year: integer("year").notNull().unique(),
});

export type Account = typeof accounts.$inferSelect;
export type Priority = typeof priorities.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type ForecastDetail = typeof forecastDetail.$inferSelect;
export type Forecast = typeof forecast.$inferSelect;
