
export interface Investor {
  id: string;
  name: string;
  email?: string;
}

export interface Card {
  id: string;
  cardName: string;
  investorId: string;
  project: string;
  isPersonal: boolean;
  spendLimitMonthly?: number;
  last4Digits?: string; // Added field for last 4 digits
}

export type TransactionCategory = 
  | "Repairs" 
  | "Utilities" 
  | "Supplies" 
  | "Mortgage" 
  | "Insurance" 
  | "HOA Fees" 
  | "Property Management" 
  | "Travel" 
  | "Marketing"
  | "Legal & Professional Fees"
  | "Furnishings"
  | "Landscaping"
  | "Other";

export interface Transaction {
  id: string;
  date: string; // ISO string for date picker compatibility, e.g., "2023-10-26"
  vendor: string;
  description: string;
  amount: number;
  category: TransactionCategory | string; // Allow string for flexibility or new categories
  cardId: string;
  investorId: string;
  project: string;
  receiptLink?: string;
  reconciled: boolean;
  sourceType: 'manual' | 'OCR' | 'import';
  statementMatchId?: string;
}

// For OCR Output (matches ocrReceiptParser output)
export interface ParsedReceiptData {
  vendor: string;
  amount: number;
  date: string; // YYYY-MM-DD
}

