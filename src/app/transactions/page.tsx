
import { TransactionsTable } from "./components/TransactionsTable";
import { getMockTransactions } from "@/lib/mock-data"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function ViewTransactionsPage() {
  // Fetch the current state of transactions
  const currentTransactions = getMockTransactions();

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
        <TransactionsTable transactions={currentTransactions} />
      </CardContent>
    </Card>
  );
}
