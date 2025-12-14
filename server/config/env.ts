import dotenv from "dotenv";
import { z } from "zod";

const loaded = dotenv.config();

if (loaded.error && (loaded.error as NodeJS.ErrnoException).code !== "ENOENT") {
  throw loaded.error;
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  DATABASE_URL: z
    .string({ required_error: "DATABASE_URL is required" })
    .min(1, "DATABASE_URL must be set")
    .refine(
      (value) => value.startsWith("postgres://") || value.startsWith("postgresql://"),
      "DATABASE_URL must be a PostgreSQL connection string"
    ),
  PORT: z.string().optional(),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().min(8).optional(),
  REPLIT_DEV_DOMAIN: z.string().optional(),
  REPLIT_INTERNAL_APP_DOMAIN: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT,
  ADMIN_BOOTSTRAP_EMAIL: process.env.ADMIN_BOOTSTRAP_EMAIL,
  ADMIN_BOOTSTRAP_PASSWORD: process.env.ADMIN_BOOTSTRAP_PASSWORD,
  REPLIT_DEV_DOMAIN: process.env.REPLIT_DEV_DOMAIN,
  REPLIT_INTERNAL_APP_DOMAIN: process.env.REPLIT_INTERNAL_APP_DOMAIN,
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

if (
  (parsed.data.ADMIN_BOOTSTRAP_EMAIL && !parsed.data.ADMIN_BOOTSTRAP_PASSWORD) ||
  (!parsed.data.ADMIN_BOOTSTRAP_EMAIL && parsed.data.ADMIN_BOOTSTRAP_PASSWORD)
) {
  throw new Error("Both ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD must be set together.");
}

const port =
  parsed.data.PORT === undefined || parsed.data.PORT === ""
    ? 5000
    : Number.parseInt(parsed.data.PORT, 10);

if (Number.isNaN(port)) {
  throw new Error("Invalid PORT value. It must be a number.");
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  databaseUrl: parsed.data.DATABASE_URL,
  port,
  adminBootstrapEmail: parsed.data.ADMIN_BOOTSTRAP_EMAIL || null,
  adminBootstrapPassword: parsed.data.ADMIN_BOOTSTRAP_PASSWORD || null,
  replitDevDomain: parsed.data.REPLIT_DEV_DOMAIN || null,
  replitInternalAppDomain: parsed.data.REPLIT_INTERNAL_APP_DOMAIN || null,
} as const;

export type AppEnv = typeof env;
