
"use client";

import * as React from "react";
import { ReceiptUploadForm } from "./components/ReceiptUploadForm";
import { TransactionForm, type TransactionFormValues } from "../components/TransactionForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ParsedReceiptData, Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

export default function OcrTransactionPage() {
  const [parsedData, setParsedData] = React.useState<Partial<Transaction> | null>(null);
  const [isParsing, setIsParsing] = React.useState(false);
  const { toast } = useToast();

  const handleParseSuccess = (data: ParsedReceiptData) => {
    toast({
      title: "Receipt Parsed Successfully!",
      description: `Vendor: ${data.vendor}, Amount: $${data.amount}, Date: ${data.date}`,
    });
    
    const initialTransactionData: Partial<Transaction> = {
        vendor: data.vendor,
        amount: data.amount,
        date: data.date, // This is already "YYYY-MM-DD"
        sourceType: 'OCR',
    };
    setParsedData(initialTransactionData);
    setIsParsing(false); 
  };
  
  // In a real app, this would send data to a backend API
  const handleFormSubmit = async (data: TransactionFormValues) => {
    setIsParsing(true); // Re-use isParsing for form submission loading state
    console.log("OCR-Prefilled Transaction Data:", {
        ...data,
        date: format(data.date, "yyyy-MM-dd"), // Format date to string for storage
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Transaction Saved",
      description: `Transaction for ${data.vendor} of $${data.amount} (from OCR) has been saved.`,
    });
    setParsedData(null); // Clear parsed data to reset form or show upload again
    setIsParsing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload and Parse Receipt</CardTitle>
          <CardDescription>
            Upload an image or PDF of your receipt. We'll try to extract the details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReceiptUploadForm onParseSuccess={handleParseSuccess} />
        </CardContent>
      </Card>

      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>Review and Save Transaction</CardTitle>
            <CardDescription>
              Verify the extracted details and complete any missing fields.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm 
              initialData={parsedData} 
              onSubmit={handleFormSubmit}
              isLoading={isParsing} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
