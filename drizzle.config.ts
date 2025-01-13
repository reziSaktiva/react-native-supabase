import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./powerSync/drizzle/AppSchema.ts",
    // out: "./drizzle",
    dialect: 'sqlite',
    dbCredentials: {
        url: "test.sqlite",
    }
});