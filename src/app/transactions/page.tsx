
"use client";

import * as React from "react";
import { TransactionsTable } from "./components/TransactionsTable";
import { getMockTransactions } from "@/lib/mock-data"; 
import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { usePathname, useSearchParams } from 'next/navigation';

export default function ViewTransactionsPage() {
  const [currentTransactions, setCurrentTransactions] = React.useState<Transaction[]>([]);
  const pathname = usePathname(); // For triggering updates if needed
  const searchParams = useSearchParams(); // For triggering updates if needed

  const fetchTransactions = React.useCallback(() => {
    // console.log("ViewTransactionsPage: Fetching transactions");
    setCurrentTransactions(getMockTransactions());
  }, []);

  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, pathname, searchParams]); // Re-fetch on navigation or when explicitly told

  const handleTransactionUpdate = () => {
    // console.log("ViewTransactionsPage: handleTransactionUpdate called, re-fetching transactions.");
    fetchTransactions();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>View, filter, and manage all recorded transactions.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/transactions/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Transaction
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <TransactionsTable 
          transactions={currentTransactions} 
          onTransactionUpdate={handleTransactionUpdate} 
        />
      </CardContent>
    </Card>
  );
}
