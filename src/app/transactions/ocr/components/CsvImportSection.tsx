
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UploadCloud, FileCheck2, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getMockCards, addTransactionToMockData } from "@/lib/mock-data";
import type { Transaction, Card as UserCard } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { parse, format, isValid } from "date-fns";

interface CsvRow {
  propertyCsv?: string; // Property from CSV, might differ from card's property
  date: string;
  vendor: string;
  description: string;
  amount: number;
  category: string;
  unitNumber?: string;
  last4Digits: string;
}

export function CsvImportSection() {
  const [file, setFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError(null);
      } else {
        setFile(null);
        setFileName(null);
        setError("Invalid file type. Please upload a CSV file.");
      }
    }
  };

  const parseCsvRow = (rowString: string, headers: string[]): Partial<CsvRow> | null => {
    const values = rowString.split(",").map(val => val.trim().replace(/^"|"$/g, '')); // Basic CSV split, handles quotes at start/end
    
    if (values.length < headers.length) {
        console.warn("Skipping row due to insufficient columns:", rowString);
        return null; 
    }

    const rowObject: any = {};
    headers.forEach((header, index) => {
        // Normalize header for easier mapping
        const normalizedHeader = header.toLowerCase().replace(/\s+/g, '');
        if (normalizedHeader.includes('property')) rowObject.propertyCsv = values[index];
        else if (normalizedHeader.includes('date')) rowObject.dateStr = values[index];
        else if (normalizedHeader.includes('vendor')) rowObject.vendor = values[index];
        else if (normalizedHeader.includes('description')) rowObject.description = values[index];
        else if (normalizedHeader.includes('amount')) rowObject.amountStr = values[index];
        else if (normalizedHeader.includes('category')) rowObject.category = values[index];
        else if (normalizedHeader.includes('unitnum')) rowObject.unitNumber = values[index];
        else if (normalizedHeader.includes('last4digitsofthecard')) rowObject.last4Digits = values[index];
    });
    return rowObject;
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a CSV file to upload.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setError("Could not read file content.");
        setIsLoading(false);
        return;
      }

      const allCards = getMockCards();
      let importedCount = 0;
      let skippedCount = 0;
      const newTransactions: Transaction[] = [];

      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== ""); // Split by newline and remove empty lines
      if (lines.length < 2) {
        setError("CSV file must contain a header row and at least one data row.");
        setIsLoading(false);
        return;
      }

      const headerLine = lines[0];
      const dataLines = lines.slice(1);
      const headers = headerLine.split(",").map(h => h.trim().replace(/^"|"$/g, ''));


      for (const line of dataLines) {
        const rowData = parseCsvRow(line, headers);

        if (!rowData || !rowData.dateStr || !rowData.vendor || !rowData.amountStr || !rowData.last4Digits) {
          console.warn("Skipping invalid CSV row (missing required fields):", line, rowData);
          skippedCount++;
          continue;
        }
        
        let parsedDate: Date;
        // Try common date formats
        const dateFormats = ['M/d/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd', 'd/M/yyyy', 'dd/MM/yyyy'];
        let validDateFound = false;
        for (const fmt of dateFormats) {
            parsedDate = parse(rowData.dateStr, fmt, new Date());
            if (isValid(parsedDate)) {
                validDateFound = true;
                break;
            }
        }

        if (!validDateFound) {
            console.warn(`Skipping row due to unparsable date: "${rowData.dateStr}" in row:`, line);
            skippedCount++;
            continue;
        }

        const amount = parseFloat(rowData.amountStr);
        if (isNaN(amount)) {
          console.warn(`Skipping row due to invalid amount: "${rowData.amountStr}" in row:`, line);
          skippedCount++;
          continue;
        }

        const matchingCard = allCards.find(card => card.last4Digits === rowData.last4Digits);

        if (!matchingCard) {
          console.warn(`Skipping row, no card found for last 4 digits: "${rowData.last4Digits}" in row:`, line);
          skippedCount++;
          continue;
        }

        const newTransaction: Transaction = {
          id: uuidv4(),
          date: format(parsedDate!, "yyyy-MM-dd"),
          vendor: rowData.vendor,
          description: rowData.description || "",
          amount: amount,
          category: rowData.category || "Other",
          cardId: matchingCard.id,
          investorId: matchingCard.investorId,
          property: matchingCard.property, // Prioritize property from the matched card
          unitNumber: rowData.unitNumber || "",
          receiptImageURI: "",
          reconciled: false,
          sourceType: "import",
        };
        newTransactions.push(newTransaction);
        importedCount++;
      }

      if (newTransactions.length > 0) {
        newTransactions.forEach(tx => addTransactionToMockData(tx));
      }

      toast({
        title: "CSV Import Complete",
        description: `${importedCount} transaction(s) imported. ${skippedCount} transaction(s) skipped.`,
      });

      // Reset form state
      setFile(null);
      setFileName(null);
      if (event.target instanceof HTMLFormElement) {
        event.target.reset();
      }
      setIsLoading(false);
    };

    reader.onerror = () => {
      setError("Failed to read file.");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="csv-upload" className="text-base font-medium">Upload Transactions CSV</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="csv-upload"
            type="file"
            accept=".csv, text/csv"
            onChange={handleFileChange}
            className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>
        {fileName && (
          <div className="flex items-center text-sm text-muted-foreground pt-1">
            <FileCheck2 className="h-4 w-4 mr-2 text-green-500" />
            <span>{fileName} selected.</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Expected CSV columns: Property, Date, Vendor, Description, Amount, Category, Unit Num, Last 4 Digits of the Card.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isLoading || !file} className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing CSV...
          </>
        ) : (
          <>
            <ListChecks className="mr-2 h-4 w-4" />
            Import from CSV
          </>
        )}
      </Button>
    </form>
  );
}
