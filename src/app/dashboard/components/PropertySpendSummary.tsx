
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface PropertySpend {
  propertyName: string;
  totalSpend: number;
}

interface PropertySpendSummaryProps {
  transactions: Transaction[];
}

const convertPropertySpendToCSV = (data: PropertySpend[]): string => {
  if (data.length === 0) {
    return "";
  }
  const headers = ["Property Name", "Total Spend"];
  const rows = data.map(item => [
    item.propertyName,
    item.totalSpend.toFixed(2)
  ]);

  const escapeCell = (cellData: string) => {
    const stringData = String(cellData);
    if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
      return `"${stringData.replace(/"/g, '""')}"`;
    }
    return stringData;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ].join('\n');

  return csvContent;
}

const downloadPropertySpendCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function PropertySpendSummary({ transactions }: PropertySpendSummaryProps) {
  const [propertySpends, setPropertySpends] = React.useState<PropertySpend[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    const spendByProperty: Record<string, number> = {};
    transactions.forEach(tx => {
      if (tx.property) { // Ensure property exists
        spendByProperty[tx.property] = (spendByProperty[tx.property] || 0) + tx.amount;
      }
    });

    const data = Object.entries(spendByProperty)
      .map(([propertyName, totalSpend]) => ({
        propertyName,
        totalSpend,
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend); // Sort by highest spend

    setPropertySpends(data);
  }, [transactions]);

  const handleDownloadCSV = () => {
    if (propertySpends.length === 0) {
      toast({
        title: "No Data",
        description: "No property spend data available to export.",
        variant: "default",
      });
      return;
    }
    const csvData = convertPropertySpendToCSV(propertySpends);
    downloadPropertySpendCSV(csvData, `estateflow_property_spend_summary_${new Date().toISOString().split('T')[0]}.csv`);
    toast({
      title: "CSV Downloaded",
      description: "Property spend summary has been exported as a CSV file.",
    });
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Download PDF (Mock)",
      description: "This feature is not yet implemented. In a real app, a PDF report would be generated.",
      variant: "default",
    });
    console.log("Attempting to download PDF (mocked). Data:", propertySpends);
  };


  if (propertySpends.length === 0 && transactions.length > 0) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Running Cost by Property</CardTitle>
          <CardDescription>Total spend for each property based on current transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No spend recorded for any specific property yet, or transactions are not assigned to properties.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (transactions.length === 0) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Running Cost by Property</CardTitle>
           <CardDescription>No transaction data available to show spend by property.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[100px]">
          <p className="text-muted-foreground">No property spend data</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
            <CardTitle>Running Cost by Property</CardTitle>
            <CardDescription>Total spend for each property based on current transactions.</CardDescription>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
            <Button onClick={handleDownloadCSV} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download CSV
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Download PDF (Mock)
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {propertySpends.map(spend => (
            <Card key={spend.propertyName} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{spend.propertyName}</CardTitle>
                {/* Icon removed from here */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${spend.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
