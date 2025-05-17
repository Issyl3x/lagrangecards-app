
import { TransactionsTable } from "./components/TransactionsTable";
import { mockTransactions } from "@/lib/mock-data"; // Using mock data for now
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function ViewTransactionsPage() {
  // In a real app, this data would be fetched
  const transactions = mockTransactions;

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
        <TransactionsTable transactions={transactions} />
      </CardContent>
    </Card>
  );
}
