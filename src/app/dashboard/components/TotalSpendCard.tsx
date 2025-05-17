
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { getMockTransactions } from "@/lib/mock-data"; // Import the getter
import { getMonth, getYear, parseISO } from "date-fns";
import { useState, useEffect } from "react";

interface TotalSpendCardProps {
  transactions: Transaction[]; // This prop will be the filtered list for the current context
}

export function TotalSpendCard({ transactions: currentTransactions }: TotalSpendCardProps) {
  const [totalSpend, setTotalSpend] = useState(0);

  useEffect(() => {
    const currentMonth = getMonth(new Date());
    const currentYear = getYear(new Date());

    // Use the passed 'currentTransactions' which might be filtered by dashboard context
    // If this card should always show total from *all* transactions, use getMockTransactions() here
    const spend = currentTransactions
      .filter(tx => {
        const txDate = parseISO(tx.date);
        return getMonth(txDate) === currentMonth && getYear(txDate) === currentYear;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
    setTotalSpend(spend);
  }, [currentTransactions]);


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
