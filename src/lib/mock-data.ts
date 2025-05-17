
import type { Investor, Card, Transaction, TransactionCategory } from './types';
import { formatISO, subDays, subMonths } from 'date-fns';

export const mockInvestors: Investor[] = [
  { id: 'investor1', name: 'Gualter', email: 'gualter@example.com' },
  { id: 'investor2', name: 'Alice Smith', email: 'alice@example.com' },
  { id: 'investor3', name: 'Bob Johnson', email: 'bob@example.com' },
];

export const mockProjects: string[] = ["Skyline Towers", "Oceanview Villas", "Mountain Retreat", "Downtown Lofts", "Suburban Homes"];

export const mockCards: Card[] = [
  { id: 'card1', cardName: 'Gualter - Skyline - Card 1', investorId: 'investor1', project: 'Skyline Towers', isPersonal: false, spendLimitMonthly: 5000 },
  { id: 'card2', cardName: 'Gualter - Oceanview - Card 1', investorId: 'investor1', project: 'Oceanview Villas', isPersonal: false, spendLimitMonthly: 3000 },
  { id: 'card3', cardName: 'Alice - Skyline - Card 1', investorId: 'investor2', project: 'Skyline Towers', isPersonal: false, spendLimitMonthly: 4000 },
  { id: 'card4', cardName: 'Bob - Mountain - Card 1', investorId: 'investor3', project: 'Mountain Retreat', isPersonal: true, spendLimitMonthly: 1000 },
  { id: 'card5', cardName: 'Alice - Personal - Card 1', investorId: 'investor2', project: 'N/A', isPersonal: true },
];

export const mockCategories: (TransactionCategory | string)[] = [
  "Repairs", "Utilities", "Supplies", "Mortgage", "Insurance", "HOA Fees", 
  "Property Management", "Travel", "Marketing", "Legal & Professional Fees",
  "Furnishings", "Landscaping", "Other"
];


const today = new Date();
export const mockTransactions: Transaction[] = [
  { 
    id: 'txn1', 
    date: formatISO(subDays(today, 5), { representation: 'date' }), 
    vendor: 'Home Depot', 
    description: 'Lumber for deck repair', 
    amount: 250.75, 
    category: 'Repairs', 
    cardId: 'card1', 
    investorId: 'investor1', 
    project: 'Skyline Towers', 
    receiptLink: 'https://docs.google.com/receipt1', 
    reconciled: true, 
    sourceType: 'manual' 
  },
  { 
    id: 'txn2', 
    date: formatISO(subDays(today, 10), { representation: 'date' }), 
    vendor: 'City Electric', 
    description: 'Monthly electricity bill', 
    amount: 120.00, 
    category: 'Utilities', 
    cardId: 'card2', 
    investorId: 'investor1', 
    project: 'Oceanview Villas', 
    reconciled: false, 
    sourceType: 'OCR' 
  },
  { 
    id: 'txn3', 
    date: formatISO(subDays(today, 15), { representation: 'date' }), 
    vendor: 'Staples', 
    description: 'Office supplies', 
    amount: 45.50, 
    category: 'Supplies', 
    cardId: 'card3', 
    investorId: 'investor2', 
    project: 'Skyline Towers', 
    receiptLink: 'https://docs.google.com/receipt2', 
    reconciled: true, 
    sourceType: 'manual' 
  },
  { 
    id: 'txn4', 
    date: formatISO(subDays(today, 2), { representation: 'date' }), 
    vendor: 'Local Hardware', 
    description: 'Paint and brushes', 
    amount: 78.22, 
    category: 'Repairs', 
    cardId: 'card1', 
    investorId: 'investor1', 
    project: 'Skyline Towers', 
    reconciled: false, 
    sourceType: 'OCR' 
  },
  { 
    id: 'txn5', 
    date: formatISO(subDays(subMonths(today, 1), 5), { representation: 'date' }), 
    vendor: 'Best Buy', 
    description: 'New office monitor', 
    amount: 299.99, 
    category: 'Furnishings', 
    cardId: 'card3', 
    investorId: 'investor2', 
    project: 'Skyline Towers', 
    reconciled: true, 
    sourceType: 'manual' 
  },
   { 
    id: 'txn6', 
    date: formatISO(subDays(subMonths(today, 1), 10), { representation: 'date' }), 
    vendor: 'Gas Company', 
    description: 'Monthly gas bill', 
    amount: 85.00, 
    category: 'Utilities', 
    cardId: 'card2', 
    investorId: 'investor1', 
    project: 'Oceanview Villas', 
    reconciled: true, 
    sourceType: 'import' 
  },
  { 
    id: 'txn7', 
    date: formatISO(subDays(subMonths(today, 2), 1), { representation: 'date' }), 
    vendor: 'Cleaning Services Inc.', 
    description: 'Monthly cleaning for common areas', 
    amount: 300.00, 
    category: 'Property Management', 
    cardId: 'card1', 
    investorId: 'investor1', 
    project: 'Skyline Towers', 
    reconciled: true, 
    sourceType: 'manual' 
  },
];
