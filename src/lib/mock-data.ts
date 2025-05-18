
import type { Investor, Card, Transaction, TransactionCategory, NewInvestorData, NewCardData } from './types';
import { formatISO, subDays, subMonths } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

let updatableInvestors: Investor[] = [
  { id: 'investor1', name: 'Gualter', email: 'gualter@example.com' },
  { id: 'investor4', name: 'Greg', email: 'greg@example.com' },
];

let updatableProperties: string[] = ["Blue Haven", "Brick Haven", "Fountain Commons"];

let updatableCards: Card[] = [
  { id: 'card1', cardName: 'Gualter - Blue Haven - Card 1', investorId: 'investor1', property: 'Blue Haven', isPersonal: false, spendLimitMonthly: 5000, last4Digits: '1111' },
  { id: 'card2', cardName: 'Gualter - Brick Haven - Card 1', investorId: 'investor1', property: 'Brick Haven', isPersonal: false, spendLimitMonthly: 3000, last4Digits: '2222' },
  {
    id: 'card6',
    cardName: 'Greg - Fountain Commons - Visa 2627',
    investorId: 'investor4',
    property: 'Fountain Commons',
    isPersonal: false,
    last4Digits: '2627'
  },
];

export const mockCategories: (TransactionCategory | string)[] = [
  "Repairs", "Utilities", "Supplies", "Mortgage", "Insurance", "HOA Fees",
  "Property Management", "Travel", "Marketing", "Legal & Professional Fees",
  "Furnishings", "Landscaping", "Appliances", "Other"
];


const today = new Date();
let updatableMockTransactions: Transaction[] = [
  {
    id: 'txn1',
    date: formatISO(subDays(today, 5), { representation: 'date' }),
    vendor: 'Home Depot',
    description: 'Lumber for deck repair',
    amount: 250.75,
    category: 'Repairs',
    cardId: 'card1', 
    investorId: 'investor1',
    property: 'Blue Haven', 
    receiptSnippet: 'Receipt #12345, SKU 98765 (Lumber 2x4x8)',
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
    property: 'Brick Haven', 
    receiptSnippet: '',
    reconciled: false,
    sourceType: 'OCR'
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
    property: 'Blue Haven', 
    receiptSnippet: 'Invoice: INV-007, Paint (Blue), Brushes (Assorted)',
    reconciled: false,
    sourceType: 'OCR'
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
    property: 'Brick Haven', 
    receiptSnippet: '',
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
    property: 'Blue Haven', 
    receiptSnippet: '',
    reconciled: true,
    sourceType: 'manual'
  },
  {
    id: 'txn8',
    date: formatISO(subDays(today, 7), { representation: 'date' }),
    vendor: 'Office Depot',
    description: 'Stationery for Fountain Commons',
    amount: 55.90,
    category: 'Supplies',
    cardId: 'card6', 
    investorId: 'investor4',
    property: 'Fountain Commons',
    receiptSnippet: 'Pens, Paper, Order #99887',
    reconciled: false,
    sourceType: 'manual'
  }
];

let updatableDeletedTransactions: Transaction[] = [];

// Getters
export const getMockInvestors = (): Investor[] => [...updatableInvestors];
export const getMockProperties = (): string[] => [...updatableProperties];
export const getMockCards = (): Card[] => [...updatableCards];
export const getMockTransactions = (): Transaction[] => [...updatableMockTransactions];
export const getDeletedTransactions = (): Transaction[] => {
  console.log("getDeletedTransactions called, returning:", updatableDeletedTransactions.length, "items", updatableDeletedTransactions.map(t => t.id));
  return [...updatableDeletedTransactions];
};

// Adders
export const addInvestor = (investorData: NewInvestorData): Investor => {
  const newInvestor: Investor = {
    id: uuidv4(),
    ...investorData,
  };
  updatableInvestors = [...updatableInvestors, newInvestor];
  console.log("Added investor:", newInvestor, "Total investors:", updatableInvestors.length);
  return newInvestor;
};

export const addProperty = (propertyName: string): string => {
  if (!updatableProperties.includes(propertyName)) {
    updatableProperties = [...updatableProperties, propertyName];
    console.log("Added property:", propertyName, "Total properties:", updatableProperties.length);
  } else {
    console.log("Property already exists:", propertyName);
  }
  return propertyName;
};

export const addCard = (cardData: NewCardData): Card => {
  const newCard: Card = {
    id: uuidv4(),
    isPersonal: false, 
    ...cardData,
  };
  updatableCards = [...updatableCards, newCard];
  console.log("Added card:", newCard, "Total cards:", updatableCards.length);
  return newCard;
};

export const addTransactionToMockData = (newTx: Transaction): void => {
  updatableMockTransactions = [newTx, ...updatableMockTransactions];
  console.log("addTransactionToMockData called with:", newTx, "Total transactions:", updatableMockTransactions.length);
};

// Updaters
export const updateTransactionInMockData = (updatedTx: Transaction): void => {
  const index = updatableMockTransactions.findIndex(tx => tx.id === updatedTx.id);
  if (index !== -1) {
    const newTransactions = [...updatableMockTransactions];
    newTransactions[index] = { ...updatedTx };
    updatableMockTransactions = newTransactions;
    console.log("updateTransactionInMockData called for ID:", updatedTx.id);
  } else {
     console.warn("updateTransactionInMockData: Transaction not found for ID:", updatedTx.id);
  }
};

// Deleters / Restorers
export const deleteTransactionFromMockData = (txId: string): void => {
  const transactionToDelete = updatableMockTransactions.find(tx => tx.id === txId);
  if (transactionToDelete) {
    console.log(`Moving transaction ${txId} to deleted items.`);
    updatableDeletedTransactions = [transactionToDelete, ...updatableDeletedTransactions];
    updatableMockTransactions = updatableMockTransactions.filter(tx => tx.id !== txId);
    console.log(`Active transactions: ${updatableMockTransactions.length}, Deleted transactions: ${updatableDeletedTransactions.length}`);
  } else {
    console.warn(`deleteTransactionFromMockData: Transaction not found for ID: ${txId} in active list.`);
  }
};

export const restoreTransactionFromMockData = (txId: string): void => {
  const transactionToRestore = updatableDeletedTransactions.find(tx => tx.id === txId);
  if (transactionToRestore) {
    console.log(`Restoring transaction ${txId} from deleted items.`);
    updatableMockTransactions = [transactionToRestore, ...updatableMockTransactions];
    updatableDeletedTransactions = updatableDeletedTransactions.filter(tx => tx.id !== txId);
    console.log(`Active transactions: ${updatableMockTransactions.length}, Deleted transactions: ${updatableDeletedTransactions.length}`);
  } else {
    console.warn(`restoreTransactionFromMockData: Transaction not found for ID: ${txId} in deleted list.`);
  }
};
