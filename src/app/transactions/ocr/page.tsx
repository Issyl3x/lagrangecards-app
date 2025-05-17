
"use client";

import * as React from "react";
import { ReceiptUploadForm } from "./components/ReceiptUploadForm";
import { TransactionForm, type TransactionFormValues } from "../components/TransactionForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ParsedReceiptData, Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";

export default function OcrTransactionPage() {
  const [parsedData, setParsedData] = React.useState<Partial<Transaction> | null>(null);
  const [isParsingOrSaving, setIsParsingOrSaving] = React.useState(false); // Combined state for OCR parsing and form submission
  const { toast } = useToast();

  const handleParseSuccess = (data: ParsedReceiptData) => {
    toast({
      title: "Receipt Parsed Successfully!",
      description: `Vendor: ${data.vendor}, Amount: $${data.amount.toFixed(2)}, Date: ${data.date}`,
    });
    
    const initialTransactionData: Partial<Transaction> = {
        vendor: data.vendor,
        amount: data.amount,
        date: data.date, // This is already "YYYY-MM-DD"
        sourceType: 'OCR',
    };
    setParsedData(initialTransactionData);
    setIsParsingOrSaving(false); 
  };
  
  const handleFormSubmit = async (data: TransactionFormValues) => {
    setIsParsingOrSaving(true); 
    console.log("OCR-Prefilled Transaction Data:", {
        ...data,
        date: format(data.date, "yyyy-MM-dd"), 
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Transaction Saved",
      description: `Transaction for ${data.vendor} of $${data.amount.toFixed(2)} (from OCR) has been saved.`,
    });
    setParsedData(null); 
    setIsParsingOrSaving(false);
  };

  const handleCopyParsedSnippet = async () => {
    if (!parsedData || typeof parsedData.vendor === 'undefined' || typeof parsedData.amount === 'undefined' || typeof parsedData.date === 'undefined') {
      toast({
        title: "Error",
        description: "No parsed data available to copy or data is incomplete.",
        variant: "destructive",
      });
      return;
    }

    const snippet = `Parsed Receipt Details:\nVendor: ${parsedData.vendor}\nAmount: $${parsedData.amount.toFixed(2)}\nDate: ${parsedData.date}`;

    try {
      await navigator.clipboard.writeText(snippet);
      toast({
        title: "Copied to Clipboard",
        description: "Parsed receipt details copied successfully.",
      });
    } catch (err) {
      console.error("Failed to copy snippet: ", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy details to clipboard.",
        variant: "destructive",
      });
    }
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
          <ReceiptUploadForm 
            onParseSuccess={handleParseSuccess} 
            // Pass isParsingOrSaving to ReceiptUploadForm if it needs to disable itself during parent's saving phase
            // For now, ReceiptUploadForm handles its own isLoading state for the actual OCR call.
          />
        </CardContent>
      </Card>

      {parsedData && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle>Review and Save Transaction</CardTitle>
                <CardDescription>
                  Verify the extracted details and complete any missing fields.
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleCopyParsedSnippet} className="w-full sm:w-auto mt-2 sm:mt-0">
                <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Parsed Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TransactionForm 
              initialData={parsedData} 
              onSubmit={handleFormSubmit}
              isLoading={isParsingOrSaving} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
