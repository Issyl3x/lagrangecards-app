
"use client"; // Make it a client component

import * as React from "react";
import { DeletedTransactionsTable } from "../components/DeletedTransactionsTable";
import { getDeletedTransactions } from "@/lib/mock-data"; 
import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePathname, useSearchParams } from 'next/navigation'; // To help trigger re-fetch

export default function DeletedTransactionsPage() {
  const [currentDeletedTransactions, setCurrentDeletedTransactions] = React.useState<Transaction[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    console.log("DeletedTransactionsPage: useEffect triggered, fetching deleted transactions. Pathname:", pathname);
    setCurrentDeletedTransactions(getDeletedTransactions());
  }, [pathname, searchParams]); // Re-fetch if path or search params change (proxy for navigation)

  return (
    <Card>
      <CardHeader>
          <CardTitle>Deleted Transactions</CardTitle>
          <CardDescription>View and restore transactions that have been deleted.</CardDescription>
      </CardHeader>
      <CardContent>
        <DeletedTransactionsTable initialDeletedTransactions={currentDeletedTransactions} />
      </CardContent>
    </Card>
  );
}
