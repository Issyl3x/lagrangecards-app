
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { TransactionForm, type TransactionFormValues } from "../../components/TransactionForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getMockTransactions, updateTransactionInMockData } from "@/lib/mock-data"; 
import type { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button"; 

export default function EditTransactionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;

  const [transactionForForm, setTransactionForForm] = React.useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);

  React.useEffect(() => {
    if (transactionId) {
      const allTransactions = getMockTransactions(); 
      const foundTransaction = allTransactions.find(tx => tx.id === transactionId);
      if (foundTransaction) {
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
    console.log("Receipt Image URI submitted from form:", data.receiptImageURI ? data.receiptImageURI.substring(0,50) + "..." : "empty"); 

    const currentTransaction = getMockTransactions().find(tx => tx.id === transactionId);

    if (!currentTransaction) {
        toast({
            title: "Error",
            description: "Cannot update transaction, original data not found.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }
    
    const updatedTransactionData: Transaction = {
        ...currentTransaction, 
        date: format(data.date, "yyyy-MM-dd"),
        vendor: data.vendor,
        description: data.description || "",
        amount: data.amount,
        category: data.category,
        investorId: data.investorId,
        property: data.property, 
        cardId: data.cardId,
        receiptImageURI: data.receiptImageURI || "",
    };
    
    updateTransactionInMockData(updatedTransactionData);
    console.log("Updated transaction via updateTransactionInMockData (ID: " + transactionId + "):", {...updatedTransactionData, receiptImageURI: updatedTransactionData.receiptImageURI ? updatedTransactionData.receiptImageURI.substring(0,50) + "..." : "empty" });

    await new Promise(resolve => setTimeout(resolve, 1000)); 
    toast({
      title: "Transaction Updated",
      description: `Transaction for ${updatedTransactionData.vendor} of $${updatedTransactionData.amount} has been updated.`,
    });
    setIsLoading(false);
    // router.refresh(); // Removed to rely on ViewTransactionsPage useEffect
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
