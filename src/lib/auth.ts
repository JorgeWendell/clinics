import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db/index"; // your drizzle instance
import * as schema from "@/db/schema"; // your drizzle schema

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    modelName: "usersTable",
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://clinicas.adelbr.tech:3000",
    "http://clinicas.adelbr.tech:3000",
    "http://192.168.15.59:3000",
    "http://192.168.15.12:3000",
  ],
  baseURL:
    process.env.NODE_ENV === "production"
      ? "http://clinicas.adelbr.tech:3000"
      : "http://192.168.15.59:3000",
});
