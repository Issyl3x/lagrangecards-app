
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";
import type { Card as UserCard, Transaction } from "@/lib/types";
import { getMonth, getYear, parseISO } from "date-fns";
// Removed useState and useEffect

interface AlertItem {
  id: string;
  type: 'warning' | 'info';
  title: string;
  message: string;
}

interface AlertsListProps {
  transactions: Transaction[];
  cards: UserCard[];
}

export function AlertsList({ transactions, cards }: AlertsListProps) {
  // Derive alerts directly from transactions and cards props
  const currentMonth = getMonth(new Date());
  const currentYear = getYear(new Date());
  const newAlerts: AlertItem[] = [];

  cards.forEach(card => {
    if (card.spendLimitMonthly && card.spendLimitMonthly > 0) {
      const cardSpendThisMonth = transactions
        .filter(tx => {
          const txDate = parseISO(tx.date);
          return tx.cardId === card.id && getMonth(txDate) === currentMonth && getYear(txDate) === currentYear;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

      if (cardSpendThisMonth > card.spendLimitMonthly) {
        newAlerts.push({
          id: `alert-${card.id}-${currentMonth}-${currentYear}`, // More unique ID
          type: 'warning',
          title: `Over Budget: ${card.cardName}${card.last4Digits ? ` (****${card.last4Digits})` : ''} ${card.property ? ` (${card.property})` : ''}`,
          message: `Spent $${cardSpendThisMonth.toFixed(2)} of $${card.spendLimitMonthly.toFixed(2)} limit.`,
        });
      }
    }
  });
  
  if (newAlerts.length === 0) {
      newAlerts.push({
          id: 'no-alerts',
          type: 'info',
          title: 'All Clear!',
          message: 'No budget alerts for the current month.',
      });
  }

  const alerts = newAlerts; // Assign derived alerts

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
        <CardDescription>Notifications for over-budget cards or properties.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-h-60 overflow-y-auto">
        {alerts.map((alert) => ( // Use the derived alerts directly
          <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-md border bg-card">
            {alert.type === 'warning' ? (
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /> // Changed to text-primary for info
            )}
            <div>
              <p className="font-semibold text-sm">{alert.title}</p>
              <p className="text-xs text-muted-foreground">{alert.message}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

