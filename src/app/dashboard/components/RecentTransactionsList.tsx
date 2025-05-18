
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { List } from "lucide-react";

interface RecentTransactionsListProps {
  transactions: Transaction[];
  itemsToShow?: number;
}

export function RecentTransactionsList({ transactions, itemsToShow = 5 }: RecentTransactionsListProps) {
  const recentTransactions = React.useMemo(() => {
    return [...transactions]
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
      .slice(0, itemsToShow);
  }, [transactions, itemsToShow]);

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>No transactions recorded yet.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[150px]">
          <p className="text-muted-foreground">No transactions to display</p>
        </CardContent>
      </Card>
    );
  }

  if (recentTransactions.length === 0 && transactions.length > 0) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>No transactions match the criteria for recent transactions (this should not normally happen if transactions exist).</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[150px]">
          <p className="text-muted-foreground">No recent transactions to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>A quick look at your latest transactions.</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/transactions">
            <List className="mr-2 h-4 w-4" />
            View All
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <ul className="space-y-3">
            {recentTransactions.map((tx) => (
              <li key={tx.id} className="p-3 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="font-semibold text-primary truncate">{tx.vendor}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {format(parseISO(tx.date), "MMM dd, yyyy")} - {tx.property}
                    </p>
                  </div>
                  <p className="font-medium whitespace-nowrap">${tx.amount.toFixed(2)}</p>
                </div>
                {tx.description && <p className="text-sm text-muted-foreground mt-1 truncate">{tx.description}</p>}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

