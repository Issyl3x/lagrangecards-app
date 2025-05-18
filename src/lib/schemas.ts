
import { z } from "zod";
import { mockCategories as allCategories } from "./mock-data"; 

const stringCategories = allCategories.filter(c => typeof c === 'string') as string[];
const categoriesForEnum: [string, ...string[]] = stringCategories.length > 0 ? stringCategories as [string, ...string[]] : ["Other", "Appliances"]; // Ensure Appliances is in fallback if mockCategories is empty initially
const categoryEnum = z.enum(categoriesForEnum);

export const transactionSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  vendor: z.string().min(1, { message: "Vendor is required." }).max(100, { message: "Vendor name is too long." }),
  description: z.string().max(500, { message: "Description is too long." }).optional().or(z.literal("")),
  amount: z.number({ invalid_type_error: "Amount must be a number." }).positive({ message: "Amount must be positive." }),
  category: categoryEnum.or(z.string().min(1, {message: "Category is required."})),
  investorId: z.string().min(1, { message: "Investor is required." }),
  investorName: z.string().optional(),
  property: z.string().min(1, { message: "Property is required." }),
  cardId: z.string().min(1, { message: "Card is required." }),
  receiptSnippet: z.string().max(500, { message: "Receipt snippet is too long (max 500 characters)." }).optional().or(z.literal("")), // Changed from receiptLink
  sourceType: z.enum(['manual', 'OCR', 'import']).default('manual'),
});
export type TransactionFormValues = z.infer<typeof transactionSchema>;


// Settings Schemas
export const investorSchema = z.object({
  name: z.string().min(1, { message: "Investor name is required." }).max(100),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
});
export type InvestorFormValues = z.infer<typeof investorSchema>;

export const propertySchema = z.object({
  name: z.string().min(1, { message: "Property name is required." }).max(100),
});
export type PropertyFormValues = z.infer<typeof propertySchema>;

export const cardSchema = z.object({
  cardName: z.string().min(1, { message: "Card name is required." }).max(100),
  investorId: z.string().min(1, { message: "Investor is required." }),
  property: z.string().min(1, { message: "Property is required." }),
  last4Digits: z.string().length(4, { message: "Must be 4 digits." }).regex(/^\d{4}$/, "Must be 4 digits.").optional().or(z.literal("")),
  spendLimitMonthly: z.preprocess(
    (val) => (val === "" || val === undefined || val === null) ? undefined : Number(val),
    z.number().positive({ message: "Spend limit must be positive." }).optional()
  ),
});
export type CardFormValues = z.infer<typeof cardSchema>;
