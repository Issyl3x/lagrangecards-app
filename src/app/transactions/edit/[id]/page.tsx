
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { TransactionForm, type TransactionFormValues } from "../../components/TransactionForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { mockTransactions } from "@/lib/mock-data"; // Using mock data
import type { Transaction } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button"; 

export default function EditTransactionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;

  // Store a copy of the transaction to be edited.
  // This copy is used to pre-fill the form.
  const [transactionForForm, setTransactionForForm] = React.useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);

  React.useEffect(() => {
    if (transactionId) {
      const foundTransaction = mockTransactions.find(tx => tx.id === transactionId);
      if (foundTransaction) {
        // Set a *copy* for the form's initial data to avoid direct mutation of mockData via form state
        setTransactionForForm({ ...foundTransaction });
      } else {
        toast({
          title: "Error",
          description: "Transaction not found.",
          variant: "destructive",
        });
        router.push("/transactions");
      }
      setIsFetching(false);
    }
  }, [transactionId, router, toast]);

  const handleSubmit = async (data: TransactionFormValues) => {
    setIsLoading(true);
    console.log("Receipt link submitted from form:", data.receiptLink); // For debugging

    const transactionToUpdate = mockTransactions.find(tx => tx.id === transactionId);

    if (!transactionToUpdate) {
        toast({
            title: "Error",
            description: "Cannot update transaction, original data not found in mock data.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }
    
    // Directly update the properties of the transaction object *within* the mockTransactions array
    transactionToUpdate.date = format(data.date, "yyyy-MM-dd");
    transactionToUpdate.vendor = data.vendor;
    transactionToUpdate.description = data.description || ""; // Ensure empty string if optional and not provided
    transactionToUpdate.amount = data.amount;
    transactionToUpdate.category = data.category;
    transactionToUpdate.investorId = data.investorId;
    transactionToUpdate.project = data.project;
    transactionToUpdate.cardId = data.cardId;
    transactionToUpdate.receiptLink = data.receiptLink || ""; // Ensure empty string if optional and not provided
    // sourceType is not changed by this form
    // reconciled status is NOT updated by this form anymore. It's handled directly in the table.
    
    console.log("Updated transaction directly in mockData (ID: " + transactionId + "):", transactionToUpdate);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Transaction Updated",
      description: `Transaction for ${transactionToUpdate.vendor} of $${transactionToUpdate.amount} has been updated.`,
    });
    setIsLoading(false);
    
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

  if (!transactionForForm) {
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
        <CardDescription>Update the details for this transaction. Reconciliation is managed in the table view.</CardDescription>
      </CardHeader>
      <CardContent>
        <TransactionForm 
          initialData={transactionForForm} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </CardContent>
    </Card>
  );
}
