import { env } from "@/env";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.AUTH_TOKEN_SECRET,
  },
  tablesFilter: ["bible-quiz_*"],
} satisfies Config;
