
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Send, Upload, Save } from "lucide-react";
import { getMockTransactions, getAllDataForBackup, restoreAllDataFromBackup } from "@/lib/mock-data";
import { convertToCSV, downloadCSV } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import type { AllDataBackup } from "@/lib/types";

export default function ExportPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = React.useState(getMockTransactions());
  const [isRestoring, setIsRestoring] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // Refresh transactions if mock data might change due to restore
    setTransactions(getMockTransactions());
  }, []);


  const handleDownloadCSV = () => {
    const currentTransactions = getMockTransactions(); // Fetch latest at time of download
    if (currentTransactions.length === 0) {
      toast({
        title: "No Data",
        description: "No transaction data available to export.",
      });
      return;
    }
    const csvData = convertToCSV(currentTransactions);
    downloadCSV(csvData, `estateflow_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    toast({
      title: "CSV Downloaded",
      description: "Transaction data has been exported as a CSV file.",
    });
  };

  const handleSendToGoogleSheets = () => {
    toast({
      title: "Send to Google Sheets (Mock)",
      description: "This feature is for demonstration. A real implementation would require Google Sheets API setup and authentication to send data directly. For now, please use the 'Download CSV' option and import it into Google Sheets.",
      variant: "default",
      duration: 8000, 
    });
    console.log("Attempting to send to Google Sheets (mocked). Data:", getMockTransactions());
  };

  const handleDownloadBackup = () => {
    const backupData = getAllDataForBackup();
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `estateflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast({
      title: "Backup Downloaded",
      description: "All application data has been backed up to a JSON file.",
    });
  };

  const handleRestoreFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setIsRestoring(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          try {
            const backupData = JSON.parse(text) as AllDataBackup;
             // Validate basic structure
            if (backupData && backupData.investors && backupData.properties && backupData.cards && backupData.transactions && backupData.deletedTransactions && backupData.timestamp) {
                const success = restoreAllDataFromBackup(backupData);
                if (success) {
                toast({
                    title: "Restore Successful",
                    description: "Data has been restored from the backup file. Please refresh the application to see all changes.",
                });
                // Optionally, trigger a hard refresh or guide user
                 window.location.reload(); 
                } else {
                toast({
                    title: "Restore Failed",
                    description: "The backup file structure seems invalid or data is corrupted.",
                    variant: "destructive",
                });
                }
            } else {
                 toast({
                    title: "Invalid Backup File",
                    description: "The selected file does not appear to be a valid EstateFlow backup.",
                    variant: "destructive",
                });
            }
          } catch (parseError) {
            console.error("Error parsing backup file:", parseError);
            toast({
              title: "Restore Failed",
              description: "Could not parse the backup file. Ensure it's a valid JSON.",
              variant: "destructive",
            });
          }
        }
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setIsRestoring(false);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error processing file for restore:", error);
      toast({
        title: "Restore Error",
        description: "An unexpected error occurred while trying to restore.",
        variant: "destructive",
      });
      setIsRestoring(false);
    }
  };


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Export Transaction Data</CardTitle>
          <CardDescription>
            Download your transaction data as a CSV file. You can then import this CSV into Google Sheets or other spreadsheet software.
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
           {transactions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No transactions available to export. Add some transactions first.
            </p>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Application Data Backup & Restore</CardTitle>
          <CardDescription>
            Download a complete backup of all application data (investors, properties, cards, transactions) or restore from a previous backup.
            This is useful for safeguarding your data or transferring it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Download Backup</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Creates a JSON file containing all your current EstateFlow data. Store this file in a safe place.
            </p>
            <Button onClick={handleDownloadBackup} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Download Full Backup (JSON)
            </Button>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Restore from Backup</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Upload a previously downloaded JSON backup file. This will <strong className="text-destructive">overwrite all current data</strong> in the application with the data from the backup file.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <Input
                type="file"
                accept=".json"
                onChange={handleRestoreFileChange}
                disabled={isRestoring}
                ref={fileInputRef}
                className="w-full sm:max-w-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isRestoring} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isRestoring ? "Restoring..." : "Upload and Restore Backup"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              After restoring, the application will reload to apply changes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
