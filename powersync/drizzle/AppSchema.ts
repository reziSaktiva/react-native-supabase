import { DrizzleAppSchema } from "@powersync/drizzle-driver";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { uuid } from "../uuid";

export const todos = sqliteTable("todos", {
  rowId: integer('rowId', { mode: 'number' }).primaryKey({ autoIncrement: true }).notNull(),
  id: text().$defaultFn(() => uuid()).notNull().primaryKey(),
  task: text("task"),
  user_id: text("user_id"),
  is_complete: integer("is_complete"),
});
export const logs = sqliteTable("logs", {
  rowId: integer('rowId', { mode: 'number' }).primaryKey({ autoIncrement: true }).notNull(),
  id: text().$defaultFn(() => uuid()).notNull().primaryKey(),
  title: text("title"),
  user_id: text("user_id"),
});
export const notes = sqliteTable("notes", {
  rowId: integer('rowId', { mode: 'number' }).primaryKey({ autoIncrement: true }).notNull(),
  id: text().$defaultFn(() => uuid()).notNull().primaryKey(),
  content: text("content"),
  log_id: text("log_id"),
});

export const drizzleSchema = {
  todos,
  logs,
  notes
};

export const AppSchema = new DrizzleAppSchema(drizzleSchema);

export type Database = (typeof AppSchema)["types"];
export type Todo = Database["todos"];
export type Log = Database["logs"];
export type Note = Database["notes"];
