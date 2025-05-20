
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Send, Upload, Save, ShieldAlert, Loader2 } from "lucide-react";
import { getMockTransactions, getAllDataForBackup, restoreAllDataFromBackup } from "@/lib/mock-data";
import { convertToCSV, downloadCSV } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import type { AllDataBackup, Transaction } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- PROTOTYPE ROLE-BASED ACCESS NOTE ---
// This page simulates role-based access using hardcoded email addresses.
// In a production application, this would be replaced by a proper authentication system.
// Export/Backup/Restore features are restricted to the ADMIN_EMAIL.
// --- END PROTOTYPE ROLE-BASED ACCESS NOTE ---
const ADMIN_EMAIL = 'jessrafalfernandez@gmail.com';
// To test non-admin view, change currentUsersEmail to something else
const currentUsersEmail = 'jessrafalfernandez@gmail.com'; 
const IS_ADMIN = currentUsersEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

export default function ExportPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = React.useState(true);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const fetchCurrentTransactions = async () => {
      setIsLoadingTransactions(true);
      try {
        const data = await getMockTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions for export:", error);
        toast({ title: "Error", description: "Could not load transactions.", variant: "destructive" });
      } finally {
        setIsLoadingTransactions(false);
      }
    };
    if (IS_ADMIN) { // Only fetch if admin, otherwise it's not needed for display
      fetchCurrentTransactions();
    } else {
      setIsLoadingTransactions(false);
    }
  }, [toast]);


  const handleDownloadCSV = async () => {
    if (!IS_ADMIN) {
      toast({ title: "Permission Denied", description: "Exporting is an administrator-only feature.", variant: "destructive" });
      return;
    }
    const currentTransactions = await getMockTransactions(); 
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
    if (!IS_ADMIN) {
      toast({ title: "Permission Denied", description: "This feature is administrator-only.", variant: "destructive" });
      return;
    }
    toast({
      title: "Send to Google Sheets (Demonstration)",
      description: "This feature is for demonstration. A direct integration requires Google API setup. Please use 'Download CSV' and import that file into Google Sheets. This functionality would be restricted to admins in a real application.",
      variant: "default",
      duration: 10000, 
    });
  };

  const handleDownloadBackup = async () => {
    if (!IS_ADMIN) {
      toast({ title: "Permission Denied", description: "Backup is an administrator-only feature.", variant: "destructive" });
      return;
    }
    try {
        const backupData = await getAllDataForBackup();
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
    } catch (error) {
        console.error("Error downloading backup:", error);
        toast({title: "Backup Error", description: "Failed to generate backup.", variant: "destructive"});
    }
  };

  const handleRestoreFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!IS_ADMIN) {
      toast({ title: "Permission Denied", description: "Restore is an administrator-only feature.", variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setIsRestoring(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          try {
            const backupData = JSON.parse(text) as AllDataBackup;
            // Basic validation
            if (backupData && backupData.investors && backupData.properties && backupData.cards && backupData.transactions && backupData.deletedTransactions && backupData.timestamp) {
                const success = await restoreAllDataFromBackup(backupData);
                if (success) {
                toast({
                    title: "Restore Successful",
                    description: "Data has been restored from the backup file. Please refresh the application to see all changes.",
                });
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

  if (!IS_ADMIN && !isLoadingTransactions) { // Show restriction if not admin and not initial loading
    return (
      <Card>
        <CardHeader>
          <CardTitle>Export & Backup Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Admin Access Required</AlertTitle>
            <AlertDescription>
              Exporting and backing up data is an administrator-only feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingTransactions && IS_ADMIN) { // Only show loader if admin is loading data
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading export options...</p>
      </div>
    );
  }


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
            <Button onClick={handleDownloadCSV} className="w-full sm:w-auto" disabled={!IS_ADMIN || transactions.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
            <Button onClick={handleSendToGoogleSheets} variant="outline" className="w-full sm:w-auto" disabled={!IS_ADMIN}>
              <Send className="mr-2 h-4 w-4" />
              Send to Google Sheets (Demo)
            </Button>
          </div>
           {transactions.length === 0 && IS_ADMIN && (
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
            <Button onClick={handleDownloadBackup} className="w-full sm:w-auto" disabled={!IS_ADMIN}>
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
                disabled={isRestoring || !IS_ADMIN}
                ref={fileInputRef}
                className="w-full sm:max-w-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isRestoring || !IS_ADMIN} 
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
