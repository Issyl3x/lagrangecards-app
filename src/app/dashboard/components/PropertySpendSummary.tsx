
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts'; // Import for side-effect: populates pdfMake.vfs

if (typeof window !== 'undefined') {
  // After importing 'pdfmake/build/vfs_fonts', pdfMake.vfs should be populated by side effect.
  // This explicit assignment is a fallback if the side effect modifies window.pdfMake
  // but not the imported pdfMake module instance directly.
  if (!pdfMake.vfs && (window as any).pdfMake && (window as any).pdfMake.vfs) {
    pdfMake.vfs = (window as any).pdfMake.vfs;
    console.warn("pdfmake vfs assigned from window.pdfMake.vfs in PropertySpendSummary. This is a fallback.");
  } else if (!pdfMake.vfs) {
     // This log indicates that vfs_fonts.js didn't manage to populate pdfMake.vfs through any means.
    console.error("Critical: pdfMake.vfs is still not defined after importing vfs_fonts.js. window.pdfMake:", (window as any).pdfMake);
  }
}


interface PropertySpend {
  propertyName: string;
  totalSpend: number;
}

interface PropertySpendSummaryProps {
  transactions: Transaction[];
}

const convertTransactionsToDetailedPropertyCSV = (transactions: Transaction[]): string => {
  const transactionsWithProperty = transactions.filter(tx => tx.property);

  if (transactionsWithProperty.length === 0) {
    return "";
  }

  // Sort by property name, then by date
  const sortedTransactions = [...transactionsWithProperty].sort((a, b) => {
    if (!a.property || !b.property) return 0; // Should not happen due to filter
    if (a.property.toLowerCase() < b.property.toLowerCase()) return -1;
    if (a.property.toLowerCase() > b.property.toLowerCase()) return 1;
    // If properties are the same, sort by date
    return parseISO(a.date).getTime() - parseISO(b.date).getTime();
  });

  const headers = [
    "Property", 
    "Date", 
    "Vendor", 
    "Description", 
    "Amount", 
    "Category", 
    "Unit Number"
  ];
  
  const rows = sortedTransactions.map(tx => [
    tx.property,
    format(parseISO(tx.date), "yyyy-MM-dd"),
    tx.vendor,
    tx.description || '',
    tx.amount.toFixed(2),
    tx.category,
    tx.unitNumber || ''
  ]);

  const escapeCell = (cellData: string | number) => {
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

const downloadDetailedPropertyCSV = (csvContent: string, filename: string): void => {
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
  const { toast } = useToast();

  const spendByProperty: Record<string, number> = {};
  transactions.forEach(tx => {
    if (tx.property) { 
      spendByProperty[tx.property] = (spendByProperty[tx.property] || 0) + tx.amount;
    }
  });

  const propertySpends = Object.entries(spendByProperty)
    .map(([propertyName, totalSpend]) => ({
      propertyName,
      totalSpend,
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend);

  const handleDownloadCSV = () => {
    const transactionsWithProperty = transactions.filter(tx => tx.property);
    if (transactionsWithProperty.length === 0) {
      toast({
        title: "No Data",
        description: "No transactions with assigned properties available to export.",
        variant: "default",
      });
      return;
    }
    const csvData = convertTransactionsToDetailedPropertyCSV(transactions); // Pass all transactions
    downloadDetailedPropertyCSV(csvData, `estateflow_detailed_property_spend_${new Date().toISOString().split('T')[0]}.csv`);
    toast({
      title: "CSV Downloaded",
      description: "Detailed property spend report has been exported as a CSV file.",
    });
  };

  const handleDownloadPDF = () => {
    const transactionsWithProperty = transactions.filter(tx => tx.property);
    if (transactionsWithProperty.length === 0) {
      toast({
        title: "No Data",
        description: "No transactions with assigned properties available to generate PDF.",
        variant: "default",
      });
      return;
    }
    if (!pdfMake.vfs) {
      toast({
        title: "PDF Error",
        description: "Font data for PDF generation is not available. Please try refreshing the page or check console for errors.",
        variant: "destructive",
      });
      console.error("pdfMake.vfs is not defined. PDF generation aborted in PropertySpendSummary.");
      return;
    }

    const groupedTransactions: Record<string, Transaction[]> = {};
    transactionsWithProperty.forEach(tx => {
      if (tx.property) { // Ensure tx.property is defined
        if (!groupedTransactions[tx.property]) {
          groupedTransactions[tx.property] = [];
        }
        groupedTransactions[tx.property].push(tx);
      }
    });

    const content: any[] = [
      { text: 'Detailed Property Spend Report', style: 'header' },
    ];

    Object.entries(groupedTransactions).forEach(([propertyName, txs]) => {
      content.push({ text: propertyName, style: 'subheader', margin: [0, 15, 0, 5] });
      const tableBody = [
        [
          { text: 'Date', style: 'tableHeader' },
          { text: 'Vendor', style: 'tableHeader' },
          { text: 'Description', style: 'tableHeader' },
          { text: 'Amount', style: 'tableHeader', alignment: 'right' },
          { text: 'Category', style: 'tableHeader' },
          { text: 'Unit #', style: 'tableHeader' },
        ],
        ...txs.sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
             .map(tx => [
          format(parseISO(tx.date), "yyyy-MM-dd"),
          tx.vendor,
          tx.description || '',
          { text: tx.amount.toFixed(2), alignment: 'right' },
          tx.category,
          tx.unitNumber || '',
        ])
      ];
      content.push({
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', 'auto', 'auto', 'auto'],
          body: tableBody,
        },
        layout: 'lightHorizontalLines',
      });
    });

    const docDefinition: any = {
      content: content,
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black',
          fillColor: '#eeeeee',
        },
      },
      defaultStyle: {
        fontSize: 9,
      }
    };

    pdfMake.createPdf(docDefinition).download(`estateflow_detailed_property_spend_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({
      title: "PDF Generated",
      description: "Detailed property spend report PDF has been downloaded.",
    });
  };
  
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

  if (propertySpends.length === 0 && transactions.length > 0) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Running Cost by Property</CardTitle>
          <CardDescription>Total spend for each property based on current transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No spend recorded for any specific property yet, or transactions are not assigned to properties.</p>
           <div className="flex gap-2 mt-4"> {/* Ensure buttons are still shown for export if needed */}
            <Button onClick={handleDownloadCSV} variant="outline" size="sm" disabled={transactions.filter(tx => tx.property).length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline" size="sm" disabled={transactions.filter(tx => tx.property).length === 0}>
                <FileText className="mr-2 h-4 w-4" />
                Download PDF
            </Button>
        </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
            <CardTitle>Running Cost by Property</CardTitle>
            <CardDescription>Total spend for each property. Download detailed transaction reports below.</CardDescription>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
            <Button onClick={handleDownloadCSV} variant="outline" size="sm" disabled={transactions.filter(tx => tx.property).length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline" size="sm" disabled={transactions.filter(tx => tx.property).length === 0}>
                <FileText className="mr-2 h-4 w-4" />
                Download PDF
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {propertySpends.map(spend => (
            <Card key={spend.propertyName} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{spend.propertyName}</CardTitle>
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

