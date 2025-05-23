
import type { Investor, Card, Transaction, TransactionCategory, NewInvestorData, AllDataBackup } from './types';
import type { CardFormValues } from './schemas';
import { formatISO, subDays, subMonths, parseISO, isValid } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// --- PROTOTYPE DATA STORAGE NOTE ---
// This application currently uses the browser's localStorage for data persistence.
// This means:
// 1. Data is stored locally in the user's browser and is NOT shared between different users,
//    browsers, or devices.
// 2. If browser data is cleared, localStorage data will be lost.
// 3. This is suitable for prototyping and single-user development.
// For a production application with shared and robust data storage,
// this module would need to be refactored to interact with a backend database
// (e.g., Firebase Firestore, Supabase).
// The "Download Full Backup (JSON)" feature on the Export page is recommended for
// manually backing up data from localStorage.
// The functions below are now asynchronous (return Promises) to mimic real backend calls,
// preparing the codebase structure for a future database integration.
// --- END PROTOTYPE DATA STORAGE NOTE ---

const APP_VERSION = "1.0.0";

// --- SIMULATED ROLE-BASED ACCESS NOTE ---
// The 'ADMIN_EMAIL' constant is used for simulating admin privileges.
// In a production app, real authentication and role management would be required.
// --- END SIMULATED ROLE-BASED ACCESS NOTE ---
const ADMIN_EMAIL = 'jessrafalfernandez@gmail.com'; // Admin user
const WORK_EMAIL_FOR_NOTIFICATIONS = 'lagrangepointllc@gmail.com'; // Target for simulated notifications

const INVESTORS_KEY = 'estateFlowInvestors_v1';
const PROPERTIES_KEY = 'estateFlowProperties_v1';
const CARDS_KEY = 'estateFlowCards_v1';
const TRANSACTIONS_KEY = 'estateFlowTransactions_v1';
const DELETED_TRANSACTIONS_KEY = 'estateFlowDeletedTransactions_v1';

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
    last4Digits: '2627',
    spendLimitMonthly: 10000
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
    receiptImageURI: 'https://placehold.co/200x200.png',
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
  },
  {
    id: 'ccpay1',
    date: formatISO(subDays(today, 3), { representation: 'date' }),
    vendor: 'Bank Transfer',
    description: 'Payment to Blue Haven Card 1',
    amount: 1000.00,
    category: 'Credit Card Payment',
    cardId: 'card1',
    investorId: 'investor1',
    property: 'Blue Haven',
    receiptImageURI: '',
    reconciled: true,
    sourceType: 'manual',
    unitNumber: ''
  },
  {
    id: 'ccpay2',
    date: formatISO(subDays(subMonths(today,1), 5), { representation: 'date' }),
    vendor: 'ACH Payment',
    description: 'Payment for Greg Visa 2627',
    amount: 750.00,
    category: 'Credit Card Payment',
    cardId: 'card6',
    investorId: 'investor4',
    property: 'Fountain Commons',
    receiptImageURI: '',
    reconciled: true,
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
        const data = JSON.parse(storedValue);
        if ((key === TRANSACTIONS_KEY || key === DELETED_TRANSACTIONS_KEY) && Array.isArray(data)) {
          return data.map((item: any) => ({
            ...item,
            date: item.date && isValid(parseISO(item.date)) ? formatISO(parseISO(item.date), { representation: 'date' }) : formatISO(new Date(), {representation: 'date'}),
          })) as T;
        }
        return data as T;
      } catch (e) {
        console.error(`Error parsing ${key} from localStorage or invalid data structure, falling back to default. Error:`, e);
        localStorage.removeItem(key); // Clear corrupted data
        return defaultValue;
      }
    }
  }
  return defaultValue;
}

// Helper function to save data to localStorage
function saveData<T>(key: string, data: T): void {
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
  "Furnishings", "Landscaping", "Appliances", "Credit Card Payment", "Other"
];

// Getters - now return Promises
export const getMockInvestors = async (): Promise<Investor[]> => {
  return Promise.resolve([...updatableInvestors]);
};
export const getMockProperties = async (): Promise<string[]> => {
  return Promise.resolve([...updatableProperties]);
};
export const getMockCards = async (): Promise<Card[]> => {
  return Promise.resolve([...updatableCards]);
};
export const getMockTransactions = async (): Promise<Transaction[]> => {
  return Promise.resolve([...updatableMockTransactions]);
};
export const getDeletedTransactions = async (): Promise<Transaction[]> => {
  return Promise.resolve([...updatableDeletedTransactions]);
};

// Adders - now return Promises
export const addInvestor = async (investorData: NewInvestorData): Promise<Investor> => {
  const newInvestor: Investor = {
    id: uuidv4(),
    ...investorData,
  };
  updatableInvestors = [...updatableInvestors, newInvestor];
  saveData(INVESTORS_KEY, updatableInvestors);
  console.log("Added investor:", newInvestor, "Total investors:", updatableInvestors.length);
  return Promise.resolve(newInvestor);
};

export const addProperty = async (propertyName: string): Promise<string> => {
  if (!updatableProperties.includes(propertyName)) {
    updatableProperties = [...updatableProperties, propertyName];
    saveData(PROPERTIES_KEY, updatableProperties);
  }
  console.log("Added property:", propertyName, "Total properties:", updatableProperties.length);
  return Promise.resolve(propertyName);
};

export const addCard = async (cardData: CardFormValues): Promise<Card> => {
  const newCard: Card = {
    id: uuidv4(),
    isPersonal: false, // Assuming cards added via this form are not personal
    ...cardData,
  };
  updatableCards = [...updatableCards, newCard];
  saveData(CARDS_KEY, updatableCards);
  console.log("Added card:", newCard, "Total cards:", updatableCards.length);
  return Promise.resolve(newCard);
};

export const addTransactionToMockData = async (newTx: Transaction, submitterEmail: string): Promise<void> => {
  updatableMockTransactions = [newTx, ...updatableMockTransactions];
  saveData(TRANSACTIONS_KEY, updatableMockTransactions);

  const investorName = updatableInvestors.find(inv => inv.id === newTx.investorId)?.name || 'Unknown Investor';
  console.log(`Transaction added by: ${submitterEmail}`);
  console.log("Transaction Details for general logging:", {
    id: newTx.id, date: newTx.date, vendor: newTx.vendor, amount: newTx.amount,
    category: newTx.category, property: newTx.property, investor: investorName,
    description: newTx.description
  });

  // --- SIMULATED WEBHOOK NOTIFICATION ---
  // This simulates sending a notification if a non-admin user adds a transaction.
  // In a real app, this would be a backend call to an email service or messaging queue.
  if (submitterEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    console.log(`SIMULATING WEBHOOK: Email notification to ${WORK_EMAIL_FOR_NOTIFICATIONS} (work email) because a transaction was added by teammate ${submitterEmail}.`);
  }
  console.log("---------------------------------------------");
  // --- END SIMULATED WEBHOOK NOTIFICATION ---
  return Promise.resolve();
};


// Updaters - now return Promises
export const updateTransactionInMockData = async (updatedTx: Transaction): Promise<void> => {
  const index = updatableMockTransactions.findIndex(tx => tx.id === updatedTx.id);
  if (index !== -1) {
    const newTransactions = [...updatableMockTransactions];
    newTransactions[index] = { ...updatedTx }; // Ensure a new object reference
    updatableMockTransactions = newTransactions;
    saveData(TRANSACTIONS_KEY, updatableMockTransactions);
  }
  return Promise.resolve();
};

export const updateCard = async (updatedCardData: Card): Promise<Card | undefined> => {
  const cardIndex = updatableCards.findIndex(card => card.id === updatedCardData.id);
  if (cardIndex !== -1) {
    updatableCards[cardIndex] = { ...updatableCards[cardIndex], ...updatedCardData };
    saveData(CARDS_KEY, updatableCards);
    console.log("Updated card:", updatableCards[cardIndex]);
    return Promise.resolve(updatableCards[cardIndex]);
  }
  console.warn("Card not found for update:", updatedCardData.id);
  return Promise.resolve(undefined);
};


// Deleters / Restorers - now return Promises
export const deleteTransactionFromMockData = async (txId: string): Promise<void> => {
  const transactionToDelete = updatableMockTransactions.find(tx => tx.id === txId);
  if (transactionToDelete) {
    updatableDeletedTransactions = [transactionToDelete, ...updatableDeletedTransactions];
    updatableMockTransactions = updatableMockTransactions.filter(tx => tx.id !== txId);
    saveData(TRANSACTIONS_KEY, updatableMockTransactions);
    saveData(DELETED_TRANSACTIONS_KEY, updatableDeletedTransactions);
    console.log("[MockData] Moved transaction to deleted items:", txId, "Active count:", updatableMockTransactions.length, "Deleted count:", updatableDeletedTransactions.length);
  } else {
     console.log("[MockData] Attempted to move transaction to deleted, but ID not found in active list:", txId);
  }
  return Promise.resolve();
};

export const permanentlyDeleteTransactionFromMockData = async (txId: string): Promise<void> => {
  const initialActiveCount = updatableMockTransactions.length;
  const initialDeletedCount = updatableDeletedTransactions.length;

  updatableMockTransactions = updatableMockTransactions.filter(tx => tx.id !== txId);
  updatableDeletedTransactions = updatableDeletedTransactions.filter(tx => tx.id !== txId);

  let permanentlyDeleted = false;
  if (updatableMockTransactions.length < initialActiveCount || updatableDeletedTransactions.length < initialDeletedCount) {
    permanentlyDeleted = true;
  }

  if (permanentlyDeleted) {
    saveData(TRANSACTIONS_KEY, updatableMockTransactions);
    saveData(DELETED_TRANSACTIONS_KEY, updatableDeletedTransactions);
    console.log("[MockData] Permanently deleted transaction:", txId, "New active count:", updatableMockTransactions.length, "New deleted count:", updatableDeletedTransactions.length);
  } else {
    console.log("[MockData] Attempted to permanently delete transaction, but ID not found:", txId);
  }
  return Promise.resolve();
};


export const restoreTransactionFromMockData = async (txId: string): Promise<void> => {
  const transactionToRestore = updatableDeletedTransactions.find(tx => tx.id === txId);
  if (transactionToRestore) {
    updatableMockTransactions = [transactionToRestore, ...updatableMockTransactions];
    updatableDeletedTransactions = updatableDeletedTransactions.filter(tx => tx.id !== txId);
    saveData(TRANSACTIONS_KEY, updatableMockTransactions);
    saveData(DELETED_TRANSACTIONS_KEY, updatableDeletedTransactions);
  }
  return Promise.resolve();
};

// Backup and Restore All Data - now return Promises
export const getAllDataForBackup = async (): Promise<AllDataBackup> => {
  const investors = await getMockInvestors();
  const properties = await getMockProperties();
  const cards = await getMockCards();
  const transactions = await getMockTransactions();
  const deletedTransactions = await getDeletedTransactions();
  return Promise.resolve({
    investors,
    properties,
    cards,
    transactions,
    deletedTransactions,
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
  });
};

export const restoreAllDataFromBackup = async (backupData: AllDataBackup): Promise<boolean> => {
  try {
    // Basic validation of backup structure
    if (
      !backupData ||
      !Array.isArray(backupData.investors) ||
      !Array.isArray(backupData.properties) ||
      !Array.isArray(backupData.cards) ||
      !Array.isArray(backupData.transactions) ||
      !Array.isArray(backupData.deletedTransactions) ||
      !backupData.timestamp ||
      !backupData.version // Simple version check, could be more sophisticated
    ) {
      console.error("Invalid backup file structure or missing version/timestamp.");
      return Promise.resolve(false);
    }

    // Consider adding a version check here if your data structure evolves significantly
    // e.g., if (backupData.version !== APP_VERSION) { ... handle migration or warn ... }

    updatableInvestors = backupData.investors;
    updatableProperties = backupData.properties;
    updatableCards = backupData.cards;
    // Ensure dates are correctly formatted if they were stringified in a non-ISO way
    updatableMockTransactions = backupData.transactions.map(tx => ({
        ...tx,
        date: tx.date && isValid(parseISO(tx.date)) ? formatISO(parseISO(tx.date), { representation: 'date' }) : formatISO(new Date(), {representation: 'date'}),
    }));
    updatableDeletedTransactions = backupData.deletedTransactions.map(tx => ({
        ...tx,
        date: tx.date && isValid(parseISO(tx.date)) ? formatISO(parseISO(tx.date), { representation: 'date' }) : formatISO(new Date(), {representation: 'date'}),
    }));

    saveData(INVESTORS_KEY, updatableInvestors);
    saveData(PROPERTIES_KEY, updatableProperties);
    saveData(CARDS_KEY, updatableCards);
    saveData(TRANSACTIONS_KEY, updatableMockTransactions);
    saveData(DELETED_TRANSACTIONS_KEY, updatableDeletedTransactions);

    console.log("Data restored successfully from backup:", backupData.timestamp, "Version:", backupData.version);
    return Promise.resolve(true);
  } catch (error) {
    console.error("Error restoring data from backup:", error);
    return Promise.resolve(false);
  }
};

export const clearAllMockDataFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(INVESTORS_KEY);
    localStorage.removeItem(PROPERTIES_KEY);
    localStorage.removeItem(CARDS_KEY);
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(DELETED_TRANSACTIONS_KEY);
    console.log("All mock data cleared from localStorage. Please refresh the application.");

    // Reset in-memory arrays to defaults
    updatableInvestors = [...defaultInvestors];
    updatableProperties = [...defaultProperties];
    updatableCards = [...defaultCards];
    updatableMockTransactions = [...defaultTransactions.map(tx => ({...tx}))]; // Create shallow copies
    updatableDeletedTransactions = [...defaultDeletedTransactions.map(tx => ({...tx}))]; // Create shallow copies
  }
};

// Expose the clear function to the window for easy debugging
if (typeof window !== 'undefined') {
  (window as any).clearAllMockDataFromLocalStorage = clearAllMockDataFromLocalStorage;
}
