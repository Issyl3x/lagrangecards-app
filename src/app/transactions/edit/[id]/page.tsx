
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
import { Button } from "@/components/ui/button"; 

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

    if (!transaction) {
        toast({
            title: "Error",
            description: "Cannot update transaction, original data not found.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }
    
    const updatedTransactionData: Transaction = {
      ...transaction, // Spread existing transaction to keep original fields not in form (like id, sourceType, reconciled status)
      ...data,          // Spread form data, this will overwrite fields like vendor, amount etc.
      id: transactionId, // Ensure ID is maintained from the original transaction
      date: format(data.date, "yyyy-MM-dd"), // Format date
      // reconciled status is NOT updated by this form anymore. It's handled directly in the table.
    };

    const transactionIndex = mockTransactions.findIndex(tx => tx.id === transactionId);
    if (transactionIndex !== -1) {
      mockTransactions[transactionIndex] = updatedTransactionData;
      console.log("Updated Transaction in mockData (ID: " + transactionId + "):", updatedTransactionData);
    } else {
       console.error("Transaction not found in mockTransactions for update");
    }


    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Transaction Updated",
      description: `Transaction for ${data.vendor} of $${data.amount} has been updated.`,
    });
    setIsLoading(false);
    // Refresh data on the target page and then navigate
    router.refresh();
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

  // We pass the original 'reconciled' status to the form's initialData
  // so it's correctly displayed if we decide to show it (read-only) in the form later.
  // However, the form itself won't submit or change this value anymore.
  const formInitialData = { ...transaction }; 
  // delete formInitialData.reconciled; // No longer part of form values.

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Transaction</CardTitle>
        <CardDescription>Update the details for this transaction. Reconciliation is managed in the table view.</CardDescription>
      </CardHeader>
      <CardContent>
        <TransactionForm 
          initialData={formInitialData} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </CardContent>
    </Card>
  );
}

