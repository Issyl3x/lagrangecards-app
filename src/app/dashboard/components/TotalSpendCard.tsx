
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { getMonth, getYear, parseISO } from "date-fns";
// Removed useState and useEffect

interface TotalSpendCardProps {
  transactions: Transaction[];
}

export function TotalSpendCard({ transactions: currentTransactions }: TotalSpendCardProps) {
  // Derive totalSpend directly from currentTransactions prop
  const currentMonth = getMonth(new Date());
  const currentYear = getYear(new Date());

  const totalSpend = currentTransactions
    .filter(tx => {
      const txDate = parseISO(tx.date);
      return getMonth(txDate) === currentMonth && getYear(txDate) === currentYear;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Spend This Month</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          ${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
      </CardContent>
    </Card>
  );
}

