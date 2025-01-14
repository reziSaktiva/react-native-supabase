import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const todos = sqliteTable('todos', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    task: text("task"),
    user_id: text("user_id"),
    is_complete: integer("is_complete"),
});