
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Transaction, Card as UserCard } from "@/lib/types";
import { getMockCards } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Landmark } from "lucide-react";

interface CreditCardPaymentsListProps {
  transactions: Transaction[];
  itemsToShow?: number;
}

export function CreditCardPaymentsList({ transactions, itemsToShow = 5 }: CreditCardPaymentsListProps) {
  const [allCards, setAllCards] = React.useState<UserCard[]>([]);

  React.useEffect(() => {
    setAllCards(getMockCards());
  }, []);

  const creditCardPayments = React.useMemo(() => {
    return transactions
      .filter(tx => tx.category === "Credit Card Payment")
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
      .slice(0, itemsToShow);
  }, [transactions, itemsToShow]);

  const getCardName = (cardId: string) => {
    const card = allCards.find(c => c.id === cardId);
    return card ? `${card.cardName}${card.last4Digits ? ` (****${card.last4Digits})` : ''}` : 'Unknown Card';
  };

  if (transactions.length === 0) {
    // This case should ideally be handled by parent, but good to have a fallback
    return (
        <Card>
            <CardHeader>
                <CardTitle>Credit Card Payments Made</CardTitle>
                <CardDescription>No transactions recorded yet to show card payments.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[150px]">
                <p className="text-muted-foreground">No data to display</p>
            </CardContent>
        </Card>
    );
  }
  
  if (creditCardPayments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credit Card Payments Made</CardTitle>
          <CardDescription>No payments towards credit cards found in the recent transactions.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[150px]">
          <p className="text-muted-foreground">No credit card payments to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Card Payments Made</CardTitle>
        <CardDescription>Recent payments made towards your credit cards.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]"> {/* Adjusted height slightly */}
          <ul className="space-y-3">
            {creditCardPayments.map((tx) => (
              <li key={tx.id} className="p-3 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="min-w-0">
                     <div className="flex items-center">
                        <Landmark className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                        <p className="font-semibold text-primary truncate">{tx.vendor}</p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate ml-7">
                      {format(parseISO(tx.date), "MMM dd, yyyy")} - To: {getCardName(tx.cardId)}
                    </p>
                  </div>
                  <p className="font-medium whitespace-nowrap">${tx.amount.toFixed(2)}</p>
                </div>
                {tx.description && <p className="text-sm text-muted-foreground mt-1 truncate ml-7">{tx.description}</p>}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
