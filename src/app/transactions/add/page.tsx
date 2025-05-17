
"use client";

import { TransactionForm, type TransactionFormValues } from "../components/TransactionForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; // For redirecting after submit
import { format } from "date-fns";

export default function AddTransactionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  // In a real app, this would send data to a backend API
  const handleSubmit = async (data: TransactionFormValues) => {
    setIsLoading(true);
    console.log("New Transaction Data:", {
        ...data,
        date: format(data.date, "yyyy-MM-dd"), // Format date to string for storage
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Transaction Saved",
      description: `Transaction for ${data.vendor} of $${data.amount} has been saved.`,
    });
    setIsLoading(false);
    // Optionally redirect or clear form
    // router.push("/transactions"); 
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

// Need React for useState
import * as React from "react";
