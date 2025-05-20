
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UploadCloud, FileCheck2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parse, isValid, formatISO } from "date-fns";
import type { StatementTransaction } from "../page"; // Import from parent page

interface StatementUploadFormProps {
  onStatementParsed: (transactions: StatementTransaction[]) => void;
}

// Helper to parse CSV rows, more robust for quoted fields
const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      if (i + 1 < line.length && line[i+1] === '"') { // Handle escaped quotes ""
        currentField += '"';
        i++; 
      }
    } else if (char === ',' && !inQuotes) {
      result.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  result.push(currentField.trim()); // Add last field
  return result;
};


export function StatementUploadForm({ onStatementParsed }: StatementUploadFormProps) {
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

      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== "");
      if (lines.length < 2) {
        setError("CSV file must contain a header row and at least one data row.");
        setIsLoading(false);
        return;
      }

      const headerLine = lines[0];
      const dataLines = lines.slice(1);
      // Normalize headers to lowercase and remove spaces for easier matching
      const headers = parseCsvLine(headerLine).map(h => h.toLowerCase().replace(/\s+/g, ''));
      
      const dateHeaderIndex = headers.findIndex(h => h.includes('date'));
      const descriptionHeaderIndex = headers.findIndex(h => h.includes('description') || h.includes('details') || h.includes('transaction') || h.includes('payee'));
      const amountHeaderIndex = headers.findIndex(h => h.includes('amount') || h.includes('value'));
      // For credit card statements, 'debit' might be charges, 'credit' might be payments.
      // For bank statements, 'debit' might be payments out, 'credit' might be deposits in.
      // We'll assume a single 'amount' column for now, where positive is charge/debit and negative is payment/credit.
      
      if (dateHeaderIndex === -1 || descriptionHeaderIndex === -1 || amountHeaderIndex === -1) {
        setError("CSV headers for 'Date', 'Description', and 'Amount' not found. Please check your CSV format.");
        setIsLoading(false);
        return;
      }

      const parsedTransactions: StatementTransaction[] = [];
      let skippedCount = 0;

      dataLines.forEach((line, index) => {
        const values = parseCsvLine(line);
        if (values.length < Math.max(dateHeaderIndex, descriptionHeaderIndex, amountHeaderIndex) + 1) {
          console.warn("Skipping row due to insufficient columns:", line);
          skippedCount++;
          return;
        }

        const dateStr = values[dateHeaderIndex];
        const description = values[descriptionHeaderIndex];
        const amountStr = values[amountHeaderIndex];
        
        let parsedDate: Date;
        const dateFormats = ['M/d/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd', 'dd/MM/yyyy', 'M-d-yyyy', 'MM-dd-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy'];
        let validDateFound = false;
        for (const fmt of dateFormats) {
            parsedDate = parse(dateStr, fmt, new Date());
            if (isValid(parsedDate)) {
                validDateFound = true;
                break;
            }
        }

        if (!validDateFound) {
            console.warn(`Skipping statement line due to unparsable date: "${dateStr}"`, line);
            skippedCount++;
            return;
        }

        // Remove common currency symbols and parse
        const cleanedAmountStr = amountStr.replace(/[$,]/g, '');
        const amount = parseFloat(cleanedAmountStr);

        if (isNaN(amount)) {
          console.warn(`Skipping statement line due to invalid amount: "${amountStr}"`, line);
          skippedCount++;
          return;
        }

        parsedTransactions.push({
          id: `stmt-${index}`, // Simple ID for list key
          date: parsedDate!,
          description: description,
          amount: amount, // Keep original sign from statement
          isReconciled: false,
        });
      });

      if (parsedTransactions.length > 0) {
        onStatementParsed(parsedTransactions);
        toast({
          title: "Statement Parsed",
          description: `${parsedTransactions.length} transaction(s) loaded from statement. ${skippedCount > 0 ? `${skippedCount} line(s) skipped.` : ''}`,
        });
      } else {
        setError(`No transactions could be parsed from the statement. ${skippedCount > 0 ? `${skippedCount} line(s) skipped.` : ''} Please check the CSV format and content.`);
      }
      
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
        <Label htmlFor="statement-upload" className="text-base font-medium">Upload Statement CSV</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="statement-upload"
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
            Parsing Statement...
          </>
        ) : (
          <>
            <UploadCloud className="mr-2 h-4 w-4" />
            Parse Statement CSV
          </>
        )}
      </Button>
    </form>
  );
}
