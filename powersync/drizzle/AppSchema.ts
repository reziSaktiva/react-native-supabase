import { DrizzleAppSchema } from "@powersync/drizzle-driver";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: text("id").primaryKey().notNull(),
  task: text("task"),
  user_id: text("user_id"),
  is_complete: integer("is_complete"),
});

export const drizzleSchema = {
  todos,
};

export const AppSchema = new DrizzleAppSchema(drizzleSchema);

export type Database = (typeof AppSchema)["types"];
export type Todo = Database["todos"];
