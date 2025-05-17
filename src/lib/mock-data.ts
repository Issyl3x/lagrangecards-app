
import type { Investor, Card, Transaction, TransactionCategory } from './types';
import { formatISO, subDays, subMonths } from 'date-fns';

export const mockInvestors: Investor[] = [
  { id: 'investor1', name: 'Gualter', email: 'gualter@example.com' },
  { id: 'investor4', name: 'Greg', email: 'greg@example.com' },
];

export const mockProperties: string[] = ["Blue Haven", "Brick Haven", "Fountain Commons"]; // Renamed from mockProjects

export const mockCards: Card[] = [
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
    cardId: 'card1', // Gualter
    investorId: 'investor1',
    property: 'Blue Haven', // Updated
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
    cardId: 'card2', // Gualter
    investorId: 'investor1',
    property: 'Brick Haven', // Updated
    receiptLink: '',
    reconciled: false,
    sourceType: 'OCR'
  },
  // Transactions for Alice (txn3, txn5) and Bob are removed.
  {
    id: 'txn4',
    date: formatISO(subDays(today, 2), { representation: 'date' }),
    vendor: 'Local Hardware',
    description: 'Paint and brushes',
    amount: 78.22,
    category: 'Repairs',
    cardId: 'card1', // Gualter
    investorId: 'investor1',
    property: 'Blue Haven', // Updated
    receiptLink: '',
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
    cardId: 'card2', // Gualter
    investorId: 'investor1',
    property: 'Brick Haven', // Updated
    receiptLink: '',
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
    cardId: 'card1', // Gualter
    investorId: 'investor1',
    property: 'Blue Haven', // Updated
    receiptLink: '',
    reconciled: true,
    sourceType: 'manual'
  },
  // Example transaction for Greg
  {
    id: 'txn8',
    date: formatISO(subDays(today, 7), { representation: 'date' }),
    vendor: 'Office Depot',
    description: 'Stationery for Fountain Commons',
    amount: 55.90,
    category: 'Supplies',
    cardId: 'card6', // Greg
    investorId: 'investor4',
    property: 'Fountain Commons', // Updated
    receiptLink: '',
    reconciled: false,
    sourceType: 'manual'
  }
];

let updatableDeletedTransactions: Transaction[] = [];

export const getMockTransactions = (): Transaction[] => {
  // console.log("getMockTransactions called, returning:", updatableMockTransactions.length, "items");
  return [...updatableMockTransactions];
};

export const addTransactionToMockData = (newTx: Transaction): void => {
  // console.log("addTransactionToMockData called with:", newTx);
  updatableMockTransactions = [newTx, ...updatableMockTransactions];
};

export const updateTransactionInMockData = (updatedTx: Transaction): void => {
  // console.log("updateTransactionInMockData called for ID:", updatedTx.id, "with data:", updatedTx);
  const index = updatableMockTransactions.findIndex(tx => tx.id === updatedTx.id);
  if (index !== -1) {
    const newTransactions = [...updatableMockTransactions];
    newTransactions[index] = { ...updatedTx }; // Ensure this is a new object for the updated item
    updatableMockTransactions = newTransactions;
  } else {
    // console.warn("updateTransactionInMockData: Transaction not found for ID:", updatedTx.id);
  }
};

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

export const getDeletedTransactions = (): Transaction[] => {
  console.log("getDeletedTransactions called, returning:", updatableDeletedTransactions.length, "items", updatableDeletedTransactions.map(t => t.id));
  return [...updatableDeletedTransactions];
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
