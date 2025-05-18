
import type { Transaction } from './types'; 
import { getMockInvestors, getMockCards } from './mock-data'; 
import { format, parseISO } from 'date-fns';

const getInvestorNameById = (id: string) => {
  const investors = getMockInvestors();
  return investors.find(i => i.id === id)?.name || id;
};

const getCardNameById = (id: string) => {
  const cards = getMockCards();
  const card = cards.find(c => c.id === id);
  if (!card) return id; 
  return `${card.cardName}${card.last4Digits ? ` (****${card.last4Digits})` : ''}`;
};

export function convertToCSV(transactions: Transaction[]): string {
  if (transactions.length === 0) {
    return '';
  }

  const headers = [
    "Date", "Vendor", "Description", "Amount", "Category", 
    "Investor", "Property", "Unit Number", "Card Used", "Receipt Image URI", "Reconciled (Yes/No)" 
  ];
  
  const rows = transactions.map(tx => [
    format(parseISO(tx.date), "yyyy-MM-dd"),
    tx.vendor,
    tx.description || '', 
    tx.amount.toFixed(2),
    tx.category,
    getInvestorNameById(tx.investorId),
    tx.property,
    tx.unitNumber || '', // Added Unit Number
    getCardNameById(tx.cardId),
    tx.receiptImageURI ? (tx.receiptImageURI.length > 50 ? tx.receiptImageURI.substring(0,50) + "... (DataURI)" : tx.receiptImageURI) : '', 
    tx.reconciled ? 'Yes' : 'No'
  ]);

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
    URL.revokeObjectURL(url);
  }
}
