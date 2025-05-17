
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, ArrowUpDown, Filter, Trash2, Edit3, ChevronsUpDown, ClipboardCopy } from "lucide-react";
import type { Transaction, Card as UserCard } from "@/lib/types"; // Added UserCard
import { mockInvestors, mockProjects, mockCards } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { useRouter } from "next/navigation"; // Added for navigation
import { useToast } from "@/hooks/use-toast"; // Added for toast notifications

interface TransactionsTableProps {
  transactions: Transaction[];
}

type SortKey = keyof Transaction | "";
const ALL_ITEMS_FILTER_VALUE = "__ALL_ITEMS__";

export function TransactionsTable({ transactions: initialTransactions }: TransactionsTableProps) {
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);
  const [filteredTransactions, setFilteredTransactions] = React.useState<Transaction[]>(initialTransactions);
  const router = useRouter(); // Initialize router
  const { toast } = useToast(); // Initialize toast

  const [investorFilter, setInvestorFilter] = React.useState<string>("");
  const [projectFilter, setProjectFilter] = React.useState<string>("");
  const [cardFilter, setCardFilter] = React.useState<string>("");
  const [dateRangeFilter, setDateRangeFilter] = React.useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const [sortKey, setSortKey] = React.useState<SortKey>("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  const [columnVisibility, setColumnVisibility] = React.useState({
    investor: true,
    project: true,
    cardUsed: true,
    reconciled: true,
    receiptLink: true,
    sourceType: false,
  });

  const investors = mockInvestors;
  const projects = mockProjects;
  const cards: UserCard[] = mockCards;

  React.useEffect(() => {
    // Update initialTransactions in state if the prop changes
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  React.useEffect(() => {
    let tempTransactions = [...transactions]; // Use the local 'transactions' state for filtering

    if (investorFilter) {
      tempTransactions = tempTransactions.filter(tx => tx.investorId === investorFilter);
    }
    if (projectFilter) {
      tempTransactions = tempTransactions.filter(tx => tx.project === projectFilter);
    }
    if (cardFilter) {
      tempTransactions = tempTransactions.filter(tx => tx.cardId === cardFilter);
    }
    if (dateRangeFilter?.from) {
        tempTransactions = tempTransactions.filter(tx => {
            const txDate = parseISO(tx.date);
            return txDate >= (dateRangeFilter.from as Date);
        });
    }
    if (dateRangeFilter?.to) {
        tempTransactions = tempTransactions.filter(tx => {
            const txDate = parseISO(tx.date);
            const toDate = new Date(dateRangeFilter.to as Date);
            toDate.setDate(toDate.getDate() + 1);
            return txDate < toDate;
        });
    }
    if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        tempTransactions = tempTransactions.filter(tx =>
            tx.vendor.toLowerCase().includes(lowerSearchTerm) ||
            (tx.description && tx.description.toLowerCase().includes(lowerSearchTerm)) ||
            tx.category.toLowerCase().includes(lowerSearchTerm)
        );
    }

    if (sortKey) {
      tempTransactions.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        let comparison = 0;
        if (valA === undefined || valA === null) comparison = -1;
        else if (valB === undefined || valB === null) comparison = 1;
        else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (sortKey === 'date') { // Explicitly handle date sorting
          comparison = parseISO(String(valA)).getTime() - parseISO(String(valB)).getTime();
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }
    setFilteredTransactions(tempTransactions);
  }, [investorFilter, projectFilter, cardFilter, dateRangeFilter, searchTerm, sortKey, sortOrder, transactions]); // Depend on 'transactions' state

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const getInvestorName = (id: string) => investors.find(i => i.id === id)?.name || 'N/A';

  const getCardName = (id: string) => {
    const card = cards.find(c => c.id === id);
    if (!card) return 'N/A';
    return `${card.cardName}${card.last4Digits ? ` (****${card.last4Digits})` : ''}`;
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey === key) {
      return sortOrder === "asc" ? <ArrowUpDown className="ml-2 h-4 w-4 inline" /> : <ArrowUpDown className="ml-2 h-4 w-4 inline transform rotate-180" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-50" />;
  };

  const handleDelete = (id: string) => {
    const updatedTransactions = transactions.filter(tx => tx.id !== id);
    setTransactions(updatedTransactions); // Update the local state
    // In a real app, you would also call an API to delete the transaction from the backend
    toast({
      title: "Transaction Deleted",
      description: `Transaction with ID ${id} has been removed.`,
      variant: "default",
    });
  };

  const handleEdit = (id: string) => {
    router.push(`/transactions/edit/${id}`);
  };

  const handleCopySnippet = async (id: string) => {
    const transaction = transactions.find(tx => tx.id === id);
    if (!transaction) {
      toast({
        title: "Error",
        description: "Transaction not found.",
        variant: "destructive",
      });
      return;
    }

    const snippet = `Transaction Details:\nDate: ${format(parseISO(transaction.date), "yyyy-MM-dd")}\nVendor: ${transaction.vendor}\nAmount: $${transaction.amount.toFixed(2)}\nCategory: ${transaction.category}\nProject: ${transaction.project}${transaction.description ? `\nDescription: ${transaction.description}` : ''}`;

    try {
      await navigator.clipboard.writeText(snippet);
      toast({
        title: "Copied to Clipboard",
        description: "Transaction details copied successfully.",
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
        <Input
            placeholder="Search vendor, description, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
        />
        <div className="flex gap-2 flex-wrap">
          <Select
            value={investorFilter === "" ? ALL_ITEMS_FILTER_VALUE : investorFilter}
            onValueChange={(value) => setInvestorFilter(value === ALL_ITEMS_FILTER_VALUE ? "" : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Investor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ITEMS_FILTER_VALUE}>All Investors</SelectItem>
              {investors.map(inv => <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={projectFilter === "" ? ALL_ITEMS_FILTER_VALUE : projectFilter}
            onValueChange={(value) => setProjectFilter(value === ALL_ITEMS_FILTER_VALUE ? "" : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ITEMS_FILTER_VALUE}>All Projects</SelectItem>
              {projects.map(proj => <SelectItem key={proj} value={proj}>{proj}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={cardFilter === "" ? ALL_ITEMS_FILTER_VALUE : cardFilter}
            onValueChange={(value) => setCardFilter(value === ALL_ITEMS_FILTER_VALUE ? "" : value)}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by Card" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ITEMS_FILTER_VALUE}>All Cards</SelectItem>
              {cards.map(card => (
                <SelectItem key={card.id} value={card.id}>
                  {card.cardName}{card.last4Digits ? ` (****${card.last4Digits})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
           <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <Filter className="mr-2 h-4 w-4" />
                {dateRangeFilter?.from ? (
                  dateRangeFilter.to ? (
                    <>
                      {format(dateRangeFilter.from, "LLL dd, y")} -{" "}
                      {format(dateRangeFilter.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRangeFilter.from, "LLL dd, y")
                  )
                ) : (
                  <span>Filter by Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRangeFilter?.from}
                selected={dateRangeFilter}
                onSelect={setDateRangeFilter}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(columnVisibility).map(([key, value]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  className="capitalize"
                  checked={value}
                  onCheckedChange={(checked) =>
                    setColumnVisibility((prev) => ({ ...prev, [key]: Boolean(checked) }))
                  }
                >
                  {key.replace(/([A-Z])/g, ' $1')}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("date")}>Date {renderSortIcon("date")}</TableHead>
              <TableHead onClick={() => handleSort("vendor")}>Vendor {renderSortIcon("vendor")}</TableHead>
              <TableHead onClick={() => handleSort("amount")} className="text-right">Amount {renderSortIcon("amount")}</TableHead>
              <TableHead onClick={() => handleSort("category")}>Category {renderSortIcon("category")}</TableHead>
              {columnVisibility.investor && <TableHead onClick={() => handleSort("investorId")}>Investor {renderSortIcon("investorId")}</TableHead>}
              {columnVisibility.project && <TableHead onClick={() => handleSort("project")}>Project {renderSortIcon("project")}</TableHead>}
              {columnVisibility.cardUsed && <TableHead onClick={() => handleSort("cardId")}>Card Used {renderSortIcon("cardId")}</TableHead>}
              {columnVisibility.reconciled && <TableHead onClick={() => handleSort("reconciled")}>Reconciled {renderSortIcon("reconciled")}</TableHead>}
              {columnVisibility.receiptLink && <TableHead>Receipt</TableHead>}
              {columnVisibility.sourceType && <TableHead onClick={() => handleSort("sourceType")}>Source {renderSortIcon("sourceType")}</TableHead>}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{format(parseISO(tx.date), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="font-medium">{tx.vendor}</TableCell>
                  <TableCell className="text-right">${tx.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tx.category}</Badge>
                  </TableCell>
                  {columnVisibility.investor && <TableCell>{getInvestorName(tx.investorId)}</TableCell>}
                  {columnVisibility.project && <TableCell>{tx.project}</TableCell>}
                  {columnVisibility.cardUsed && <TableCell>{getCardName(tx.cardId)}</TableCell>}
                  {columnVisibility.reconciled && (
                    <TableCell>
                      <Badge variant={tx.reconciled ? "default" : "secondary"} className={tx.reconciled ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                        {tx.reconciled ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                  )}
                  {columnVisibility.receiptLink && (
                    <TableCell>
                      {tx.receiptLink ? (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={tx.receiptLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  )}
                  {columnVisibility.sourceType && <TableCell>{tx.sourceType.toUpperCase()}</TableCell>}
                  <TableCell>
                    <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleCopySnippet(tx.id)} title="Copy Details"><ClipboardCopy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(tx.id)} title="Edit Transaction"><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tx.id)} title="Delete Transaction" className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={Object.values(columnVisibility).filter(Boolean).length + 5} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


    