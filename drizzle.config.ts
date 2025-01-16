import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./drizzle/schema.ts",
    out: "./drizzle/migrations",
    dialect: 'postgresql',
    dbCredentials: {
        host: "db.wwlclbyzrznyuovffsbh.supabase.co",
        port: 5432,
        user: "postgres",
        password: "@@Bangsatt99",
        database: "postgres",
    }
});