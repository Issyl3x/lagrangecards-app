
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
import { addTransactionToMockData } from "@/lib/mock-data"; 
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";

export default function OcrTransactionPage() {
  const [parsedDataForForm, setParsedDataForForm] = React.useState<Partial<Transaction> | null>(null);
  const [isParsingOrSaving, setIsParsingOrSaving] = React.useState(false); 
  const { toast } = useToast();
  const router = useRouter(); 
  
  const handleParseSuccess = (data: ParsedReceiptData) => {
    toast({
      title: "Receipt Parsed Successfully!",
      description: `Vendor: ${data.vendor}, Amount: $${data.amount.toFixed(2)}, Date: ${data.date}`,
    });
    
    // Attempt to parse the date string from OCR (YYYY-MM-DD)
    let parsedDate;
    try {
        parsedDate = parseISO(data.date); // data.date should be YYYY-MM-DD
        if (isNaN(parsedDate.getTime())) { // Check if parseISO returned a valid date
            throw new Error("Invalid date format from OCR");
        }
    } catch (e) {
        console.error("Error parsing date from OCR, defaulting to today:", e);
        parsedDate = new Date(); 
        toast({
            title: "Date Parsing Warning",
            description: "Could not parse date from receipt, defaulting to today. Please verify.",
            variant: "default" // Using "default" as variant "warning" is not standard ShadCN
        });
    }
    
    const initialTransactionData: Partial<Transaction> = {
        vendor: data.vendor,
        amount: data.amount,
        date: format(parsedDate, "yyyy-MM-dd"), // Store as ISO string
        sourceType: 'OCR',
        reconciled: false, 
        receiptImageURI: "", // Initialize receiptImageURI - user can upload separately if desired
    };
    setParsedDataForForm(initialTransactionData);
    setIsParsingOrSaving(false); 
  };
  
  const handleFormSubmit = async (formData: TransactionFormValues) => {
    setIsParsingOrSaving(true); 
    
    const newTransactionData: Transaction = {
      id: uuidv4(),
      ...formData,
      date: format(formData.date, "yyyy-MM-dd"), 
      reconciled: false, 
      receiptImageURI: formData.receiptImageURI || "", 
    };

    addTransactionToMockData(newTransactionData);
    console.log("OCR-Prefilled Transaction Data Saved:", newTransactionData);

    await new Promise(resolve => setTimeout(resolve, 1000)); 

    toast({
      title: "Transaction Saved",
      description: `Transaction for ${newTransactionData.vendor} of $${newTransactionData.amount.toFixed(2)} (from OCR) has been saved.`,
    });
    setParsedDataForForm(null); 
    setIsParsingOrSaving(false);
    router.push("/transactions"); 
  };

  const handleCopyParsedSnippet = async () => {
    if (!parsedDataForForm || typeof parsedDataForForm.vendor === 'undefined' || typeof parsedDataForForm.amount === 'undefined' || typeof parsedDataForForm.date === 'undefined') {
      toast({
        title: "Error",
        description: "No parsed data available to copy or data is incomplete.",
        variant: "destructive",
      });
      return;
    }
    const dateToDisplay = parsedDataForForm.date ? format(parseISO(parsedDataForForm.date), "yyyy-MM-dd") : "N/A";
    const snippet = `Parsed Receipt Details:\nVendor: ${parsedDataForForm.vendor}\nAmount: $${parsedDataForForm.amount.toFixed(2)}\nDate: ${dateToDisplay}`;

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
          />
        </CardContent>
      </Card>

      {parsedDataForForm && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle>Review and Save Transaction</CardTitle>
                <CardDescription>
                  Verify the extracted details and complete any missing fields. You can upload the receipt image below if desired.
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleCopyParsedSnippet} className="w-full sm:w-auto mt-2 sm:mt-0">
                <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Parsed Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TransactionForm 
              initialData={parsedDataForForm} 
              onSubmit={handleFormSubmit}
              isLoading={isParsingOrSaving} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
