
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { Building2 } from "lucide-react";

interface PropertySpend {
  propertyName: string;
  totalSpend: number;
}

interface PropertySpendSummaryProps {
  transactions: Transaction[];
}

export function PropertySpendSummary({ transactions }: PropertySpendSummaryProps) {
  const [propertySpends, setPropertySpends] = React.useState<PropertySpend[]>([]);

  React.useEffect(() => {
    const spendByProperty: Record<string, number> = {};
    transactions.forEach(tx => {
      if (tx.property) { // Ensure property exists
        spendByProperty[tx.property] = (spendByProperty[tx.property] || 0) + tx.amount;
      }
    });

    const data = Object.entries(spendByProperty)
      .map(([propertyName, totalSpend]) => ({
        propertyName,
        totalSpend,
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend); // Sort by highest spend

    setPropertySpends(data);
  }, [transactions]);

  if (propertySpends.length === 0 && transactions.length > 0) { // Show message if transactions exist but no property spend
     return (
      <Card>
        <CardHeader>
          <CardTitle>Running Cost by Property</CardTitle>
          <CardDescription>Total spend for each property based on current transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No spend recorded for any specific property yet, or transactions are not assigned to properties.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (transactions.length === 0) { // Show message if no transactions at all
     return (
      <Card>
        <CardHeader>
          <CardTitle>Running Cost by Property</CardTitle>
           <CardDescription>No transaction data available to show spend by property.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[100px]">
          <p className="text-muted-foreground">No property spend data</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Running Cost by Property</CardTitle>
        <CardDescription>Total spend for each property based on current transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {propertySpends.map(spend => (
            <Card key={spend.propertyName} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{spend.propertyName}</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${spend.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
