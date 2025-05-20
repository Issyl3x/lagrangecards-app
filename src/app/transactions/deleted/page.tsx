
"use client"; 

import * as React from "react";
import { DeletedTransactionsTable } from "../components/DeletedTransactionsTable";
import { getDeletedTransactions } from "@/lib/mock-data"; 
import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from "lucide-react";

export default function DeletedTransactionsPage() {
  const [currentDeletedTransactions, setCurrentDeletedTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fetchDeleted = React.useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("DeletedTransactionsPage: useEffect triggered, fetching deleted transactions. Pathname:", pathname);
      const data = await getDeletedTransactions();
      setCurrentDeletedTransactions(data);
    } catch (error) {
      console.error("Error fetching deleted transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pathname]);

  React.useEffect(() => {
    fetchDeleted();
  }, [fetchDeleted, searchParams]); // Re-fetch if path or search params change (proxy for navigation)


  const handleTransactionUpdate = () => { // Callback for DeletedTransactionsTable to trigger re-fetch
    fetchDeleted();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading deleted items...</p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
          <CardTitle>Deleted Transactions</CardTitle>
          <CardDescription>View and restore transactions that have been deleted.</CardDescription>
      </CardHeader>
      <CardContent>
        <DeletedTransactionsTable 
          initialDeletedTransactions={currentDeletedTransactions} 
          onTransactionUpdate={handleTransactionUpdate}
        />
      </CardContent>
    </Card>
  );
}
