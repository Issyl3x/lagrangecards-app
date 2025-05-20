
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { Transaction, Card as UserCard } from "@/lib/types";
import { getMockCards } from "@/lib/mock-data";
import { format, parseISO, isValid } from "date-fns";
import type { DateRange } from "react-day-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Landmark, Filter, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import * as pdfMakeNs from 'pdfmake/build/pdfmake'; // Renamed to pdfMakeNs
import * as pdfFontsNs from 'pdfmake/build/vfs_fonts'; // Renamed to pdfFontsNs

if (typeof window !== 'undefined') {
  const targetPdfMake = pdfMakeNs; // This is the object used for .createPdf
  if (pdfFontsNs.pdfMake && pdfFontsNs.pdfMake.vfs) {
    (targetPdfMake as any).vfs = pdfFontsNs.pdfMake.vfs;
  } else if ((window as any).pdfMake && (window as any).pdfMake.vfs) {
    (targetPdfMake as any).vfs = (window as any).pdfMake.vfs;
    console.warn("pdfmake vfs assigned from window.pdfMake.vfs in CreditCardPaymentsList. Original pdfFontsNs.pdfMake was:", pdfFontsNs.pdfMake);
  } else {
    console.error("Unable to set pdfmake vfs in CreditCardPaymentsList: Font data not found in pdfFontsNs.pdfMake or window.pdfMake. pdfFontsNs.pdfMake:", pdfFontsNs.pdfMake, "window.pdfMake:", (window as any).pdfMake);
  }
}


interface CreditCardPaymentsListProps {
  transactions: Transaction[];
  itemsToShow?: number;
}

const convertPaymentsToCSV = (payments: Transaction[], cards: UserCard[]): string => {
  if (payments.length === 0) {
    return "";
  }

  const getCardName = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    return card ? `${card.cardName}${card.last4Digits ? ` (****${card.last4Digits})` : ''}` : 'Unknown Card';
  };

  const headers = [
    "Date", 
    "Paid To Card", 
    "Amount", 
    "Paid From Account", 
    "Note"
  ];
  
  const rows = payments.map(tx => [
    tx.date ? format(parseISO(tx.date), "yyyy-MM-dd") : 'N/A',
    getCardName(tx.cardId),
    tx.amount.toFixed(2),
    tx.vendor, // For payments, vendor is the bank account used
    tx.description || '',
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

const downloadPaymentCSV = (csvContent: string, filename: string): void => {
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


export function CreditCardPaymentsList({ transactions: allTransactions, itemsToShow = 5 }: CreditCardPaymentsListProps) {
  const [allCards, setAllCards] = React.useState<UserCard[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = React.useState<DateRange | undefined>(undefined);
  const { toast } = useToast();

  React.useEffect(() => {
    setAllCards(getMockCards());
  }, []);

  const filteredCreditCardPayments = React.useMemo(() => {
    let payments = allTransactions.filter(tx => tx.category === "Credit Card Payment");

    if (dateRangeFilter?.from) {
      payments = payments.filter(tx => {
        const txDate = parseISO(tx.date);
        if (!isValid(txDate)) return false;
        let inRange = txDate >= (dateRangeFilter.from as Date);
        if (dateRangeFilter.to) {
          const toDate = new Date(dateRangeFilter.to as Date);
          toDate.setDate(toDate.getDate() + 1); // Include the 'to' date
          inRange = inRange && txDate < toDate;
        }
        return inRange;
      });
    }
    
    return payments
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
      // .slice(0, itemsToShow); // We will show all filtered items in the table and PDF/CSV
  }, [allTransactions, dateRangeFilter]);

  const paginatedPayments = React.useMemo(() => {
    return filteredCreditCardPayments.slice(0, itemsToShow);
  }, [filteredCreditCardPayments, itemsToShow]);

  const getCardName = (cardId: string) => {
    const card = allCards.find(c => c.id === cardId);
    return card ? `${card.cardName}${card.last4Digits ? ` (****${card.last4Digits})` : ''}` : 'Unknown Card';
  };

  const handleDownloadCSV = () => {
    if (filteredCreditCardPayments.length === 0) {
      toast({
        title: "No Data",
        description: "No credit card payments available to export for the selected period.",
        variant: "default",
      });
      return;
    }
    const csvData = convertPaymentsToCSV(filteredCreditCardPayments, allCards);
    downloadPaymentCSV(csvData, `estateflow_credit_card_payments_${new Date().toISOString().split('T')[0]}.csv`);
    toast({
      title: "CSV Downloaded",
      description: "Credit card payments report has been exported as a CSV file.",
    });
  };

  const handleDownloadPDF = () => {
    if (filteredCreditCardPayments.length === 0) {
      toast({
        title: "No Data",
        description: "No credit card payments to generate PDF for the selected period.",
      });
      return;
    }

    const tableBody = [
      [
        { text: 'Date', style: 'tableHeader' },
        { text: 'Paid To Card', style: 'tableHeader' },
        { text: 'Amount', style: 'tableHeader', alignment: 'right' },
        { text: 'Paid From Account', style: 'tableHeader' },
        { text: 'Note', style: 'tableHeader' },
      ],
      ...filteredCreditCardPayments.map(tx => [
        tx.date ? format(parseISO(tx.date), "yyyy-MM-dd") : 'N/A',
        getCardName(tx.cardId),
        { text: tx.amount.toFixed(2), alignment: 'right' },
        tx.vendor,
        tx.description || '',
      ])
    ];

    let reportTitle = "Credit Card Payments Report";
    if (dateRangeFilter?.from) {
        reportTitle += `\nFrom: ${format(dateRangeFilter.from, "LLL dd, yyyy")}`;
        if (dateRangeFilter.to) {
            reportTitle += ` To: ${format(dateRangeFilter.to, "LLL dd, yyyy")}`;
        }
    }


    const docDefinition: any = {
      content: [
        { text: reportTitle, style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', '*', 'auto'],
            body: tableBody,
          },
          layout: 'lightHorizontalLines', // optional
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
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

    pdfMakeNs.createPdf(docDefinition).download(`estateflow_credit_card_payments_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({
      title: "PDF Generated",
      description: "Credit card payments report PDF has been downloaded.",
    });
  };
  
  let descriptionText = "Recent payments made towards your credit cards.";
  if (dateRangeFilter?.from) {
    descriptionText = `Payments made towards your credit cards from ${format(dateRangeFilter.from, "LLL dd, y")}`;
    if (dateRangeFilter.to) {
      descriptionText += ` to ${format(dateRangeFilter.to, "LLL dd, y")}.`;
    } else {
       descriptionText += ".";
    }
  }


  if (allTransactions.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Credit Card Payments Made</CardTitle>
                <CardDescription>No transactions recorded yet to show card payments.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[150px]">
                <p className="text-muted-foreground">No data to display</p>
            </CardContent>
        </Card>
    );
  }
  
  let emptyStateMessage = "No credit card payments to display for the selected period.";
  if (!dateRangeFilter?.from && allTransactions.filter(tx => tx.category === "Credit Card Payment").length === 0) {
      emptyStateMessage = "No credit card payments found in any transactions.";
  } else if (dateRangeFilter?.from && filteredCreditCardPayments.length === 0) {
      emptyStateMessage = "No credit card payments match the selected date range.";
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <CardTitle>Credit Card Payments Made</CardTitle>
                <CardDescription>{descriptionText}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto text-sm font-normal">
                    <Filter className="mr-2 h-4 w-4" />
                    {dateRangeFilter?.from ? (
                        dateRangeFilter.to ? (
                        <>
                            {format(dateRangeFilter.from, "LLL dd, y")} - {format(dateRangeFilter.to, "LLL dd, y")}
                        </>
                        ) : (
                        format(dateRangeFilter.from, "LLL dd, y")
                        )
                    ) : (
                        <span>Filter by Date</span>
                    )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRangeFilter?.from}
                    selected={dateRangeFilter}
                    onSelect={setDateRangeFilter}
                    numberOfMonths={1}
                    />
                </PopoverContent>
                </Popover>
                <Button onClick={handleDownloadCSV} variant="outline" size="sm" disabled={filteredCreditCardPayments.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    CSV
                </Button>
                <Button onClick={handleDownloadPDF} variant="outline" size="sm" disabled={filteredCreditCardPayments.length === 0}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {paginatedPayments.length === 0 ? (
             <div className="flex items-center justify-center h-[150px]">
                <p className="text-muted-foreground">{emptyStateMessage}</p>
            </div>
        ) : (
            <ScrollArea className="h-[200px]">
            <ul className="space-y-3">
                {paginatedPayments.map((tx) => (
                <li key={tx.id} className="p-3 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                    <div className="min-w-0">
                        <div className="flex items-center">
                            <Landmark className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                            {/* For payments, tx.vendor is the bank account used */}
                            <p className="font-semibold text-primary truncate">{tx.vendor}</p> 
                        </div>
                        <p className="text-xs text-muted-foreground truncate ml-7">
                        {format(parseISO(tx.date), "MMM dd, yyyy")} - To: {getCardName(tx.cardId)}
                        </p>
                    </div>
                    <p className="font-medium whitespace-nowrap">${tx.amount.toFixed(2)}</p>
                    </div>
                    {tx.description && <p className="text-sm text-muted-foreground mt-1 truncate ml-7">{tx.description}</p>}
                </li>
                ))}
            </ul>
            </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
