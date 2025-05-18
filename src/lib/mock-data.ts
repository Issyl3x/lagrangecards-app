
import type { Investor, Card, Transaction, TransactionCategory, NewInvestorData, NewCardData } from './types';
import { formatISO, subDays, subMonths, parseISO, isValid } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const INVESTORS_KEY = 'estateFlowInvestors';
const PROPERTIES_KEY = 'estateFlowProperties';
const CARDS_KEY = 'estateFlowCards';
const TRANSACTIONS_KEY = 'estateFlowTransactions';
const DELETED_TRANSACTIONS_KEY = 'estateFlowDeletedTransactions';

// Default data (used if localStorage is empty or invalid)
const defaultInvestors: Investor[] = [
  { id: 'investor1', name: 'Gualter', email: 'gualter@example.com' },
  { id: 'investor4', name: 'Greg', email: 'greg@example.com' },
];

const defaultProperties: string[] = ["Blue Haven", "Brick Haven", "Fountain Commons"];

const defaultCards: Card[] = [
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

const today = new Date();
const defaultTransactions: Transaction[] = [
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
    unitNumber: 'Unit 10A',
    receiptImageURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
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
    unitNumber: '',
    receiptImageURI: '',
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
    receiptImageURI: '',
    reconciled: false,
    sourceType: 'OCR',
    unitNumber: ''
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
    receiptImageURI: '',
    reconciled: true,
    sourceType: 'import',
    unitNumber: ''
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
    receiptImageURI: '',
    reconciled: true,
    sourceType: 'manual',
    unitNumber: ''
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
    receiptImageURI: '',
    reconciled: false,
    sourceType: 'manual',
    unitNumber: ''
  }
];

const defaultDeletedTransactions: Transaction[] = [];

// Helper function to load data from localStorage
function loadData<T>(key: string, defaultValue: T): T {
  if (typeof window !== 'undefined') {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      try {
        // Ensure dates in transactions are correctly parsed if stored as strings
        if (key === TRANSACTIONS_KEY || key === DELETED_TRANSACTIONS_KEY) {
          const parsedItems = JSON.parse(storedValue) as Transaction[];
          return parsedItems.map(item => ({
            ...item,
            // Ensure date is a string in 'yyyy-MM-dd' format, which is how it should be stored.
            // If it was stored as a Date object string, re-format it.
            // TransactionForm expects Date objects, but mock-data stores ISO strings.
            date: isValid(parseISO(item.date)) ? formatISO(parseISO(item.date), { representation: 'date' }) : formatISO(new Date(), {representation: 'date'}),
          })) as T;
        }
        return JSON.parse(storedValue) as T;
      } catch (e) {
        console.error(`Error parsing ${key} from localStorage`, e);
        return defaultValue; // Fallback to default if parsing fails
      }
    }
  }
  return defaultValue;
}

// Helper function to save data to localStorage
function saveData<T>(key: string, data: T) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

let updatableInvestors: Investor[] = loadData<Investor[]>(INVESTORS_KEY, defaultInvestors);
let updatableProperties: string[] = loadData<string[]>(PROPERTIES_KEY, defaultProperties);
let updatableCards: Card[] = loadData<Card[]>(CARDS_KEY, defaultCards);
let updatableMockTransactions: Transaction[] = loadData<Transaction[]>(TRANSACTIONS_KEY, defaultTransactions);
let updatableDeletedTransactions: Transaction[] = loadData<Transaction[]>(DELETED_TRANSACTIONS_KEY, defaultDeletedTransactions);


export const mockCategories: (TransactionCategory | string)[] = [
  "Repairs", "Utilities", "Supplies", "Mortgage", "Insurance", "HOA Fees",
  "Property Management", "Travel", "Marketing", "Legal & Professional Fees",
  "Furnishings", "Landscaping", "Appliances", "Other"
];

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
  saveData(INVESTORS_KEY, updatableInvestors);
  console.log("Added investor:", newInvestor, "Total investors:", updatableInvestors.length);
  return newInvestor;
};

export const addProperty = (propertyName: string): string => {
  if (!updatableProperties.includes(propertyName)) {
    updatableProperties = [...updatableProperties, propertyName];
    saveData(PROPERTIES_KEY, updatableProperties);
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
  saveData(CARDS_KEY, updatableCards);
  console.log("Added card:", newCard, "Total cards:", updatableCards.length);
  return newCard;
};

export const addTransactionToMockData = (newTx: Transaction): void => {
  updatableMockTransactions = [newTx, ...updatableMockTransactions];
  saveData(TRANSACTIONS_KEY, updatableMockTransactions);
  console.log("addTransactionToMockData called with:", newTx, "Total transactions:", updatableMockTransactions.length);
};

// Updaters
export const updateTransactionInMockData = (updatedTx: Transaction): void => {
  const index = updatableMockTransactions.findIndex(tx => tx.id === updatedTx.id);
  if (index !== -1) {
    const newTransactions = [...updatableMockTransactions];
    newTransactions[index] = { ...updatedTx };
    updatableMockTransactions = newTransactions;
    saveData(TRANSACTIONS_KEY, updatableMockTransactions);
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
    saveData(TRANSACTIONS_KEY, updatableMockTransactions);
    saveData(DELETED_TRANSACTIONS_KEY, updatableDeletedTransactions);
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
    saveData(TRANSACTIONS_KEY, updatableMockTransactions);
    saveData(DELETED_TRANSACTIONS_KEY, updatableDeletedTransactions);
    console.log(`Active transactions: ${updatableMockTransactions.length}, Deleted transactions: ${updatableDeletedTransactions.length}`);
  } else {
    console.warn(`restoreTransactionFromMockData: Transaction not found for ID: ${txId} in deleted list.`);
  }
};

// Function to clear all mock data from localStorage (for debugging/reset)
export const clearAllMockDataFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(INVESTORS_KEY);
    localStorage.removeItem(PROPERTIES_KEY);
    localStorage.removeItem(CARDS_KEY);
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(DELETED_TRANSACTIONS_KEY);
    console.log("All mock data cleared from localStorage. Please refresh the application.");
    // Optionally, reset in-memory arrays to defaults immediately
    updatableInvestors = [...defaultInvestors];
    updatableProperties = [...defaultProperties];
    updatableCards = [...defaultCards];
    updatableMockTransactions = [...defaultTransactions];
    updatableDeletedTransactions = [...defaultDeletedTransactions];
  }
};
// To use clearAllMockDataFromLocalStorage, you could call it from the browser console:
// e.g., `window.clearAllMockDataFromLocalStorage()` if you expose it globally for dev,
// or trigger it via a development-only UI element.
if (typeof window !== 'undefined') {
  (window as any).clearAllMockDataFromLocalStorage = clearAllMockDataFromLocalStorage;
}
