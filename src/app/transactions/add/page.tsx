
"use client";

import * as React from "react";
import { TransactionForm, type TransactionFormValues } from "../components/TransactionForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; // For redirecting after submit
import { format } from "date-fns";
import { mockTransactions } from "@/lib/mock-data"; // Import the array
import type { Transaction } from "@/lib/types";   // Import the type
import { v4 as uuidv4 } from 'uuid'; // For generating new IDs


export default function AddTransactionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  // In a real app, this would send data to a backend API
  const handleSubmit = async (data: TransactionFormValues) => {
    setIsLoading(true);

    const newTransactionData: Transaction = {
      id: uuidv4(), // Generate a new unique ID
      ...data,
      date: format(data.date, "yyyy-MM-dd"), // Format date to string for storage
      reconciled: false, // New transactions default to not reconciled
      // sourceType is already in 'data' from the form
    };

    // Add to the beginning of the mockTransactions array
    mockTransactions.unshift(newTransactionData);
    console.log("New Transaction Added to mockData:", newTransactionData);


    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Transaction Saved",
      description: `Transaction for ${data.vendor} of $${data.amount} has been saved.`,
    });
    setIsLoading(false);
    // Refresh data on the target page and then navigate
    router.refresh(); 
    router.push("/transactions"); 
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Transaction</CardTitle>
        <CardDescription>Fill in the details for the new transaction.</CardDescription>
      </CardHeader>
      <CardContent>
        <TransactionForm onSubmit={handleSubmit} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}

