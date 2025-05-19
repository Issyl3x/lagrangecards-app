
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


export default function AddTransactionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: TransactionFormValues) => {
    setIsLoading(true);
    console.log("Webhook triggered", data);

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
          submittedBy: "jessrafalfernandez@gmail.com",
          submittedAt: new Date().toISOString(),
        }),
      })
        .then((res) => {
          if (res.ok) {
            console.log("Webhook sent successfully:", res.status);
          } else {
            console.error("Webhook failed with status:", res.status);
            // Optionally, you could get more details:
            // res.text().then(text => console.error("Webhook error body:", text));
          }
        })
        .catch((err) => console.error("Webhook fetch error:", err));
    } catch (fetchError) {
        console.error("Error during webhook fetch operation:", fetchError);
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

    addTransactionToMockData(newTransactionData);
    console.log("New Transaction Added via addTransactionToMockData:", newTransactionData);

    // Simulate async operation if needed for other logic, or remove if just for webhook
    // await new Promise(resolve => setTimeout(resolve, 100));

    toast({
      title: "Transaction Saved",
      description: (
        <>
          Transaction for {data.vendor} of ${data.amount.toFixed(2)} has been saved.
          <br />
          <em className="text-xs text-muted-foreground">(Simulated: Webhook notification would be sent to work email.)</em>
        </>
      ),
    });
    setIsLoading(false);
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
