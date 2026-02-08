import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: (() => {
      const baseUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
      const authToken = process.env.TURSO_AUTH_TOKEN;
      if (!authToken || baseUrl.startsWith("file:")) return baseUrl;
      try {
        const url = new URL(baseUrl);
        url.searchParams.set("authToken", authToken);
        return url.toString();
      } catch {
        return baseUrl;
      }
    })(),
  },
} satisfies Config;
