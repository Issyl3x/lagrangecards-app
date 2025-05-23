
"use client";

import * as React from "react";
import { TransactionForm, type TransactionFormValues } from "../components/TransactionForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { addTransactionToMockData } from "@/lib/mock-data";
import type { Transaction } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';

const ADMIN_EMAIL = 'jessrafalfernandez@gmail.com';
const currentUsersEmail = 'teammate@example.com'; 

export default function AddTransactionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: TransactionFormValues) => {
    setIsSubmitting(true);
    console.log("Webhook triggered by form submission, data:", data);

    try {
      await fetch("https://hook.us2.make.com/y7mimw79elkvk3dm3x86xu7v373ah4f2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          property: data.property,
          amount: data.amount,
          category: data.category,
          note: data.description || "",
          submittedBy: currentUsersEmail, 
          submittedAt: new Date().toISOString(),
        }),
      })
        .then((res) => {
          if (res.ok) {
            console.log("External Make.com Webhook sent successfully:", res.status);
          } else {
            console.error("External Make.com Webhook failed with status:", res.status);
          }
        })
        .catch((err) => console.error("External Make.com Webhook fetch error:", err));
    } catch (fetchError) {
        console.error("Error during external Make.com webhook fetch operation:", fetchError);
    }

    const newTransactionData: Transaction = {
      id: uuidv4(),
      ...data,
      date: format(data.date, "yyyy-MM-dd"),
      property: data.property,
      unitNumber: data.unitNumber || "",
      receiptImageURI: data.receiptImageURI || "",
      reconciled: false,
      sourceType: data.sourceType || 'manual',
    };
    
    try {
        await addTransactionToMockData(newTransactionData, currentUsersEmail);
        console.log("New Transaction Added to mock data via addTransactionToMockData:", newTransactionData);

        toast({
        title: "Transaction Saved",
        description: (
            <>
            Transaction for {data.vendor} of ${data.amount.toFixed(2)} has been saved.
            <br />
            <em className="text-xs text-muted-foreground">(Simulated: Internal webhook notification logged to console.)</em>
            </>
        ),
        });
        // router.refresh(); // This might not be necessary if ViewTransactionsPage refreshes on navigation
        router.push("/transactions");
    } catch (error) {
        console.error("Error saving transaction:", error);
        toast({ title: "Error", description: "Failed to save transaction.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Transaction</CardTitle>
        <CardDescription>Fill in the details for the new transaction.</CardDescription>
      </CardHeader>
      <CardContent>
        <TransactionForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </CardContent>
    </Card>
  );
}
