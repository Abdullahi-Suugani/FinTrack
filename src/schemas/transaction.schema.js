import { z } from "zod";
const date = z.coerce.date();
export const transactionSchema = z.object({
  title: z.string().min(1).max(200),
  amount: z.coerce.number().positive(),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1).max(100),
  date,
});
export const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  type: z.enum(["income", "expense"]).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  startDate: date.optional(),
  endDate: date.optional(),
});
export const monthSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
});
