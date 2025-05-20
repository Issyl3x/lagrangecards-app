
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { TransactionForm, type TransactionFormValues } from "../../components/TransactionForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getMockTransactions, updateTransactionInMockData } from "@/lib/mock-data"; 
import type { Transaction } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button"; 

export default function EditTransactionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;

  const [transactionForForm, setTransactionForForm] = React.useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);

  React.useEffect(() => {
    const fetchTransaction = async () => {
      if (transactionId) {
        setIsFetching(true);
        try {
          const allTransactions = await getMockTransactions(); 
          const foundTransaction = allTransactions.find(tx => tx.id === transactionId);
          if (foundTransaction) {
            setTransactionForForm({ ...foundTransaction, date: parseISO(foundTransaction.date) as any }); // Ensure date is a Date object
          } else {
            toast({
              title: "Error",
              description: "Transaction not found.",
              variant: "destructive",
            });
            router.push("/transactions");
          }
        } catch (error) {
          console.error("Error fetching transaction for edit:", error);
          toast({ title: "Error", description: "Could not load transaction details.", variant: "destructive" });
        } finally {
          setIsFetching(false);
        }
      }
    };
    fetchTransaction();
  }, [transactionId, router, toast]);

  const handleSubmit = async (data: TransactionFormValues) => {
    setIsSubmitting(true);
    console.log("Receipt Image URI submitted from form:", data.receiptImageURI ? data.receiptImageURI.substring(0,50) + "..." : "empty"); 

    const allTransactions = await getMockTransactions();
    const currentTransaction = allTransactions.find(tx => tx.id === transactionId);

    if (!currentTransaction) {
        toast({
            title: "Error",
            description: "Cannot update transaction, original data not found.",
            variant: "destructive",
        });
        setIsSubmitting(false);
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
        unitNumber: data.unitNumber || "", 
        cardId: data.cardId,
        receiptImageURI: data.receiptImageURI || "",
        // 'reconciled' and 'sourceType' are preserved from currentTransaction
    };
    
    try {
        await updateTransactionInMockData(updatedTransactionData);
        console.log("Updated transaction via updateTransactionInMockData (ID: " + transactionId + "):", {...updatedTransactionData, receiptImageURI: updatedTransactionData.receiptImageURI ? updatedTransactionData.receiptImageURI.substring(0,50) + "..." : "empty" });

        toast({
        title: "Transaction Updated",
        description: `Transaction for ${updatedTransactionData.vendor} of $${updatedTransactionData.amount} has been updated.`,
        });
        // router.refresh(); // Might not be necessary if ViewTransactionsPage refreshes on navigation
        router.push("/transactions"); 
    } catch (error) {
        console.error("Error updating transaction:", error);
        toast({ title: "Error", description: "Failed to update transaction.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
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
          isLoading={isSubmitting} 
        />
      </CardContent>
    </Card>
  );
}
