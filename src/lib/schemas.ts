
import { z } from "zod";
import { mockCategories } from "./mock-data"; // To ensure category is one of the valid ones

const categoryEnum = z.enum(mockCategories as [string, ...string[]]);

export const transactionSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  vendor: z.string().min(1, { message: "Vendor is required." }).max(100, { message: "Vendor name is too long." }),
  description: z.string().max(500, { message: "Description is too long." }).optional().or(z.literal("")),
  amount: z.number({ invalid_type_error: "Amount must be a number." }).positive({ message: "Amount must be positive." }),
  category: categoryEnum.or(z.string().min(1, {message: "Category is required."})), // Allows custom categories if not in enum
  investorId: z.string().min(1, { message: "Investor is required." }),
  investorName: z.string().optional(), // For display or internal use, not directly submitted
  project: z.string().min(1, { message: "Project is required." }),
  cardId: z.string().min(1, { message: "Card is required." }),
  receiptLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  reconciled: z.boolean().default(false),
  sourceType: z.enum(['manual', 'OCR', 'import']).default('manual'),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
