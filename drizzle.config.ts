import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./drizzle/schema.ts",
    out: "./drizzle/migrations",
    dialect: 'sqlite',
    dbCredentials: {
        url: "/Users/rezisaktiva/Library/Developer/CoreSimulator/Devices/121233BD-6DA6-46A6-9861-5817B1F1540D/data/Containers/Data/Application/74BB4CED-F043-42A2-AEC3-4154A8FBC62A/Documents/test.sqlite",
    }
});