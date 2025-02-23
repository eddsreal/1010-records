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

export type Account = typeof accounts.$inferSelect;
export type Priority = typeof priorities.$inferSelect;
export type Category = typeof categories.$inferSelect;
