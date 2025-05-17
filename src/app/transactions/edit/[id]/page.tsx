
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { TransactionForm, type TransactionFormValues } from "../../components/TransactionForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { mockTransactions } from "@/lib/mock-data"; // Using mock data
import type { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function EditTransactionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;

  const [transaction, setTransaction] = React.useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);

  React.useEffect(() => {
    if (transactionId) {
      // Simulate fetching transaction data
      const foundTransaction = mockTransactions.find(tx => tx.id === transactionId);
      if (foundTransaction) {
        setTransaction(foundTransaction);
      } else {
        toast({
          title: "Error",
          description: "Transaction not found.",
          variant: "destructive",
        });
        router.push("/transactions"); // Redirect if not found
      }
      setIsFetching(false);
    }
  }, [transactionId, router, toast]);

  // In a real app, this would send data to a backend API to update the transaction
  const handleSubmit = async (data: TransactionFormValues) => {
    setIsLoading(true);
    console.log("Updated Transaction Data (ID: " + transactionId + "):", {
        ...data,
        date: format(data.date, "yyyy-MM-dd"), // Format date to string for storage
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Transaction Updated",
      description: `Transaction for ${data.vendor} of $${data.amount} has been updated.`,
    });
    setIsLoading(false);
    // Optionally redirect or refresh data
    router.push("/transactions"); 
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading transaction details...</p>
      </div>
    );
  }

  if (!transaction) {
    // This case should ideally be handled by the redirect in useEffect,
    // but it's good practice to have a fallback.
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The transaction you are trying to edit could not be found.</p>
          <Button onClick={() => router.push("/transactions")} className="mt-4">
            Back to Transactions
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Transaction</CardTitle>
        <CardDescription>Update the details for this transaction.</CardDescription>
      </CardHeader>
      <CardContent>
        <TransactionForm 
          initialData={transaction} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </CardContent>
    </Card>
  );
}
