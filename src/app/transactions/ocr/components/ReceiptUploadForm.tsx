
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UploadCloud, FileCheck2 } from "lucide-react";
import { ocrReceiptParser, type OcrReceiptParserInput, type OcrReceiptParserOutput } from "@/ai/flows/ocr-receipt-parser";
import type { ParsedReceiptData } from "@/lib/types";

interface ReceiptUploadFormProps {
  onParseSuccess: (data: ParsedReceiptData) => void;
}

export function ReceiptUploadForm({ onParseSuccess }: ReceiptUploadFormProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null); // Clear previous errors
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        if (!base64data) {
            setError("Could not read file data.");
            setIsLoading(false);
            return;
        }
        
        const input: OcrReceiptParserInput = { photoDataUri: base64data };
        const result: OcrReceiptParserOutput = await ocrReceiptParser(input);
        
        onParseSuccess({
          vendor: result.vendor,
          amount: result.amount,
          date: result.date, // Already in YYYY-MM-DD
        });
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("OCR Parsing Error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during OCR parsing.");
    } finally {
      // setIsLoading(false); //isLoading is set to false in onParseSuccess or error cases
    }
  };
  
  // This effect runs when onParseSuccess is called, which means OCR is done.
  React.useEffect(() => {
    if (isLoading && !error) { // if it was loading and no new error, success implies loading should stop
       // setIsLoading(false); // This is handled by parent page now.
    }
  }, [isLoading, error]);


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="receipt-upload" className="text-base font-medium">Upload Receipt Image</Label>
        <div className="flex items-center space-x-2">
            <Input
            id="receipt-upload"
            type="file"
            accept="image/png, image/jpeg, image/webp, application/pdf"
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
            Parsing Receipt...
          </>
        ) : (
          <>
            <UploadCloud className="mr-2 h-4 w-4" />
            Parse Receipt
          </>
        )}
      </Button>
    </form>
  );
}
