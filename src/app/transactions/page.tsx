
"use client";

import * as React from "react";
import { TransactionsTable } from "./components/TransactionsTable";
import { getMockTransactions } from "@/lib/mock-data"; 
import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Loader2 } from "lucide-react";
import { usePathname, useSearchParams } from 'next/navigation';

export default function ViewTransactionsPage() {
  const [currentTransactions, setCurrentTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const pathname = usePathname(); 
  const searchParams = useSearchParams(); 

  const fetchTransactions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMockTransactions();
      setCurrentTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, pathname, searchParams]); 

  const handleTransactionUpdate = () => {
    fetchTransactions(); // Re-fetch data when an update occurs
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading transactions...</p>
      </div>
    );
  }

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
