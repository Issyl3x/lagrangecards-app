
import type { Transaction, Card as UserCard } from './types'; // Added UserCard
import { mockInvestors, mockCards } from './mock-data'; // To resolve names
import { format, parseISO } from 'date-fns';

const getInvestorName = (id: string) => mockInvestors.find(i => i.id === id)?.name || id;

const getCardName = (id: string) => {
  const card = mockCards.find(c => c.id === id);
  if (!card) return id; // Or 'N/A'
  return `${card.cardName}${card.last4Digits ? ` (****${card.last4Digits})` : ''}`;
};

export function convertToCSV(transactions: Transaction[]): string {
  if (transactions.length === 0) {
    return '';
  }

  const headers = [
    "Date", "Vendor", "Description", "Amount", "Category", 
    "Investor", "Project", "Card Used", "Receipt Link", "Reconciled (Yes/No)"
  ];
  
  const rows = transactions.map(tx => [
    format(parseISO(tx.date), "yyyy-MM-dd"),
    tx.vendor,
    tx.description,
    tx.amount.toFixed(2),
    tx.category,
    getInvestorName(tx.investorId),
    tx.project,
    getCardName(tx.cardId),
    tx.receiptLink || '',
    tx.reconciled ? 'Yes' : 'No'
  ]);

  // Escape commas and quotes in cell data
  const escapeCell = (cellData: string | number) => {
    const stringData = String(cellData);
    if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
      return `"${stringData.replace(/"/g, '""')}"`;
    }
    return stringData;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ].join('\n');

  return csvContent;
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

