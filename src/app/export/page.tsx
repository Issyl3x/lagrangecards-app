
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Send } from "lucide-react";
import { mockTransactions } from "@/lib/mock-data";
import { convertToCSV, downloadCSV } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";

export default function ExportPage() {
  const { toast } = useToast();

  const handleDownloadCSV = () => {
    const csvData = convertToCSV(mockTransactions);
    downloadCSV(csvData, `estateflow_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    toast({
      title: "CSV Downloaded",
      description: "Transaction data has been exported as a CSV file.",
    });
  };

  const handleSendToGoogleSheets = () => {
    // This is a mock implementation. Real implementation requires Google Sheets API.
    toast({
      title: "Send to Google Sheets (Mock)",
      description: "This feature is not yet implemented. In a real app, data would be sent to Google Sheets.",
      variant: "default", // 'default' was 'info', but info is not a variant
    });
    console.log("Attempting to send to Google Sheets (mocked). Data:", mockTransactions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Transaction Data</CardTitle>
        <CardDescription>
          Download your transaction data as a CSV file or send it to Google Sheets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          Export all recorded transaction data for external analysis, reporting, or backup. 
          The CSV format includes all key details for each transaction.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleDownloadCSV} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
          <Button onClick={handleSendToGoogleSheets} variant="outline" className="w-full sm:w-auto">
            <Send className="mr-2 h-4 w-4" />
            Send to Google Sheets (Mock)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
