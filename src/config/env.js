import "dotenv/config";
import { z } from "zod";
const schema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  API_URL: z.string().url().default("http://localhost:4000"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  ADMIN_PASSWORD: z.string().min(8).default("Admin123!"),
});
const result = schema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.issues
    .map((issue) => `- ${issue.path.join(".") || "environment"}: ${issue.message}`)
    .join("\n");
  console.error(`Environment validation failed:\n${issues}`);
  process.exit(1);
}

export const env = result.data;
