
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
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, ArrowUpDown, Filter, Trash2, Edit3, ChevronsUpDown, ClipboardCopy, ImageIcon, CheckSquare, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Transaction, Card as UserCard, Investor } from "@/lib/types";
import {
  getMockInvestors,
  getMockProperties,
  getMockCards,
  deleteTransactionFromMockData,
  updateTransactionInMockData,
  // getMockTransactions, // No longer fetched directly here, comes via props
  permanentlyDeleteTransactionFromMockData
} from "@/lib/mock-data";
import { format, parseISO, isValid } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TransactionsTableProps {
  transactions: Transaction[];
  onTransactionUpdate: () => Promise<void>;
}

type SortKey = keyof Transaction | "";
const ALL_ITEMS_FILTER_VALUE = "__ALL_ITEMS__";

// --- PROTOTYPE ROLE-BASED ACCESS NOTE ---
// This component simulates role-based access using hardcoded email addresses.
// - ADMIN_EMAIL: Represents the administrator.
// - currentUsersEmail: Simulates the email of the currently "logged-in" user.
// - IS_ADMIN: Determines if the current user has admin privileges.
// In a production application, this would be replaced by a proper authentication
// system (e.g., Firebase Authentication) and role management.
// To test different roles, manually change 'currentUsersEmail'.
// --- END PROTOTYPE ROLE-BASED ACCESS NOTE ---
const ADMIN_EMAIL = 'jessrafalfernandez@gmail.com';
const currentUsersEmail = 'jessrafalfernandez@gmail.com'; // Change to 'teammate@example.com' to test non-admin
const IS_ADMIN = currentUsersEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();


export function TransactionsTable({ transactions: initialTransactions, onTransactionUpdate }: TransactionsTableProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [investorFilter, setInvestorFilter] = React.useState<string>(ALL_ITEMS_FILTER_VALUE);
  const [propertyFilter, setPropertyFilter] = React.useState<string>(ALL_ITEMS_FILTER_VALUE);
  const [cardFilter, setCardFilter] = React.useState<string>(ALL_ITEMS_FILTER_VALUE);
  const [dateRangeFilter, setDateRangeFilter] = React.useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const [sortKey, setSortKey] = React.useState<SortKey>("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  const [columnVisibility, setColumnVisibility] = React.useState({
    investor: true,
    property: true,
    unitNumber: true,
    cardUsed: true,
    recordedInBuildium: true, // Renamed from 'reconciled'
    receiptImageURI: true,
    sourceType: false,
  });

  const [investors, setInvestorsState] = React.useState<Investor[]>([]);
  const [properties, setPropertiesState] = React.useState<string[]>([]);
  const [cards, setCardsState] = React.useState<UserCard[]>([]);
  const [isFetchingDropdownData, setIsFetchingDropdownData] = React.useState(true);
  const [duplicateTransactionIds, setDuplicateTransactionIds] = React.useState<Set<string>>(new Set());

  const [filteredTransactions, setFilteredTransactions] = React.useState<Transaction[]>(initialTransactions);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [transactionToPermanentlyDelete, setTransactionToPermanentlyDelete] = React.useState<string | null>(null);


  React.useEffect(() => {
    const fetchDropdowns = async () => {
      setIsFetchingDropdownData(true);
      try {
        const [investorsData, propertiesData, cardsData] = await Promise.all([
          getMockInvestors(),
          getMockProperties(),
          getMockCards()
        ]);
        setInvestorsState(investorsData);
        setPropertiesState(propertiesData);
        setCardsState(cardsData);
      } catch (error) {
        console.error("Error fetching dropdown data for TransactionsTable:", error);
      } finally {
        setIsFetchingDropdownData(false);
      }
    };
    fetchDropdowns();
  }, []);

  React.useEffect(() => {
    if (!initialTransactions || initialTransactions.length === 0) {
      setDuplicateTransactionIds(new Set());
      setFilteredTransactions(initialTransactions || []);
      return;
    }

    const signatures = new Map<string, string[]>();
    initialTransactions.forEach(tx => {
      if (tx.isDuplicateConfirmed) { // Don't flag confirmed duplicates
        return;
      }
      const signature = `${tx.date}-${tx.vendor.toLowerCase()}-${tx.amount.toFixed(2)}`;
      if (!signatures.has(signature)) {
        signatures.set(signature, []);
      }
      signatures.get(signature)!.push(tx.id);
    });

    const newDuplicateIds = new Set<string>();
    signatures.forEach((idsInGroup) => {
      if (idsInGroup.length > 1) {
        idsInGroup.forEach(id => newDuplicateIds.add(id));
      }
    });
    setDuplicateTransactionIds(newDuplicateIds);
  }, [initialTransactions]);


  React.useEffect(() => {
    let tempTransactions = [...initialTransactions];

    if (investorFilter && investorFilter !== ALL_ITEMS_FILTER_VALUE) {
      tempTransactions = tempTransactions.filter(tx => tx.investorId === investorFilter);
    }
    if (propertyFilter && propertyFilter !== ALL_ITEMS_FILTER_VALUE) {
      tempTransactions = tempTransactions.filter(tx => tx.property === propertyFilter);
    }
    if (cardFilter && cardFilter !== ALL_ITEMS_FILTER_VALUE) {
      tempTransactions = tempTransactions.filter(tx => tx.cardId === cardFilter);
    }
    if (dateRangeFilter?.from) {
      tempTransactions = tempTransactions.filter(tx => {
        const txDate = parseISO(tx.date);
        if (!isValid(txDate)) return false;
        return txDate >= (dateRangeFilter.from as Date);
      });
    }
    if (dateRangeFilter?.to) {
      tempTransactions = tempTransactions.filter(tx => {
        const txDate = parseISO(tx.date);
        if (!isValid(txDate)) return false;
        const toDate = new Date(dateRangeFilter.to as Date);
        toDate.setDate(toDate.getDate() + 1); // Include the 'to' date for range
        return txDate < toDate;
      });
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempTransactions = tempTransactions.filter(tx =>
        tx.vendor.toLowerCase().includes(lowerSearchTerm) ||
        (tx.description && tx.description.toLowerCase().includes(lowerSearchTerm)) ||
        (tx.unitNumber && tx.unitNumber.toLowerCase().includes(lowerSearchTerm)) ||
        tx.category.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (sortKey) {
      tempTransactions.sort((a, b) => {
        const valA = a[sortKey as keyof Transaction];
        const valB = b[sortKey as keyof Transaction];

        let comparison = 0;
        if (valA === undefined || valA === null) comparison = -1;
        else if (valB === undefined || valB === null) comparison = 1;
        else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (sortKey === 'date') {
          comparison = parseISO(String(valA)).getTime() - parseISO(String(valB)).getTime();
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }
    setFilteredTransactions(tempTransactions);
  }, [investorFilter, propertyFilter, cardFilter, dateRangeFilter, searchTerm, sortKey, sortOrder, initialTransactions]);

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

  const handleDeleteToRecycleBin = async (id: string) => {
    if (!IS_ADMIN) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to move transactions.",
        variant: "destructive",
      });
      return;
    }
    await deleteTransactionFromMockData(id);
    toast({
      title: "Transaction Moved",
      description: `Transaction has been moved to Deleted Items.`,
    });
    await onTransactionUpdate();
  };

  const handleEdit = (id: string) => {
    if (!IS_ADMIN) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to edit transactions.",
        variant: "destructive",
      });
      return;
    }
    router.push(`/transactions/edit/${id}`);
  };

  const handleToggleRecordedInBuildium = async (id: string) => {
    if (!IS_ADMIN) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to change this status.",
        variant: "destructive",
      });
      return;
    }
    const transactionToUpdate = initialTransactions.find(tx => tx.id === id);
    if (transactionToUpdate) {
      const updatedTransaction = { ...transactionToUpdate, reconciled: !transactionToUpdate.reconciled };
      await updateTransactionInMockData(updatedTransaction);
      toast({
        title: "Status Updated",
        description: `Transaction ${updatedTransaction.vendor} marked as ${updatedTransaction.reconciled ? "Recorded in Buildium" : "Not Recorded in Buildium"}.`,
      });
      await onTransactionUpdate();
    }
  };

  const handleConfirmDuplicate = async (transactionId: string) => {
    if (!IS_ADMIN) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to confirm transactions.",
        variant: "destructive",
      });
      return;
    }
    const transactionToConfirm = initialTransactions.find(tx => tx.id === transactionId);
    if (transactionToConfirm) {
      await updateTransactionInMockData({ ...transactionToConfirm, isDuplicateConfirmed: true });
      await onTransactionUpdate();
      toast({
        title: "Transaction Confirmed",
        description: "This transaction will no longer be flagged as a potential duplicate.",
      });
    }
  };

  const openPermanentDeleteDialog = (id: string) => {
    if (!IS_ADMIN) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to permanently delete transactions.",
        variant: "destructive",
      });
      return;
    }
    setTransactionToPermanentlyDelete(id);
    setIsAlertOpen(true);
  };

  const handlePermanentDeleteConfirm = async () => {
    if (transactionToPermanentlyDelete) {
      await permanentlyDeleteTransactionFromMockData(transactionToPermanentlyDelete);
      toast({
        title: "Transaction Permanently Deleted",
        description: `Transaction has been permanently deleted.`,
      });
      await onTransactionUpdate(); 
      setTransactionToPermanentlyDelete(null);
    }
    setIsAlertOpen(false);
  };


  const handleCopyDetails = async (id: string) => {
    const transaction = initialTransactions.find(tx => tx.id === id);
    if (!transaction) {
      toast({
        title: "Error",
        description: "Transaction not found.",
        variant: "destructive",
      });
      return;
    }
    const details = `Transaction Details:\nDate: ${format(parseISO(transaction.date), "yyyy-MM-dd")}\nVendor: ${transaction.vendor}\nAmount: $${transaction.amount.toFixed(2)}\nCategory: ${transaction.category}\nProperty: ${transaction.property}${transaction.unitNumber ? `\nUnit: ${transaction.unitNumber}` : ''}${transaction.receiptImageURI ? `\nReceipt Image Attached` : ''}`;
    try {
      await navigator.clipboard.writeText(details);
      toast({
        title: "Copied to Clipboard",
        description: "Transaction details copied successfully.",
      });
    } catch (err) {
      console.error("Failed to copy details: ", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy details to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
          <Input
            placeholder="Search vendor, desc, category, unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2 flex-wrap">
            <Select
              value={investorFilter}
              onValueChange={(value) => setInvestorFilter(value === ALL_ITEMS_FILTER_VALUE ? ALL_ITEMS_FILTER_VALUE : value)}
              disabled={isFetchingDropdownData}
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
              value={propertyFilter}
              onValueChange={(value) => setPropertyFilter(value === ALL_ITEMS_FILTER_VALUE ? ALL_ITEMS_FILTER_VALUE : value)}
              disabled={isFetchingDropdownData}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ITEMS_FILTER_VALUE}>All Properties</SelectItem>
                {properties.map(prop => <SelectItem key={prop} value={prop}>{prop}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select
              value={cardFilter}
              onValueChange={(value) => setCardFilter(value === ALL_ITEMS_FILTER_VALUE ? ALL_ITEMS_FILTER_VALUE : value)}
              disabled={isFetchingDropdownData}
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
                    {key === 'recordedInBuildium' ? 'Recorded in Buildium' : key.replace(/([A-Z])/g, ' $1').replace('URI', ' URI')}
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
                {columnVisibility.property && <TableHead onClick={() => handleSort("property")}>Property {renderSortIcon("property")}</TableHead>}
                {columnVisibility.unitNumber && <TableHead onClick={() => handleSort("unitNumber")}>Unit # {renderSortIcon("unitNumber")}</TableHead>}
                {columnVisibility.cardUsed && <TableHead onClick={() => handleSort("cardId")}>Card Used {renderSortIcon("cardId")}</TableHead>}
                {columnVisibility.recordedInBuildium && <TableHead onClick={() => handleSort("reconciled")}>Recorded in Buildium {renderSortIcon("reconciled")}</TableHead>}
                {columnVisibility.receiptImageURI && <TableHead>Receipt</TableHead>}
                {columnVisibility.sourceType && <TableHead onClick={() => handleSort("sourceType")}>Source {renderSortIcon("sourceType")}</TableHead>}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{format(parseISO(tx.date), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="font-medium flex items-center">
                      {tx.vendor}
                      {duplicateTransactionIds.has(tx.id) && !tx.isDuplicateConfirmed && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-block ml-2" aria-label="Potential duplicate transaction">
                                <AlertTriangle className="h-4 w-4 text-destructive inline" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent><p>Potential duplicate transaction.</p></TooltipContent>
                          </Tooltip>
                          {IS_ADMIN && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleConfirmDuplicate(tx.id)} className="ml-1">
                                  <CheckSquare className="h-4 w-4 text-green-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Confirm this transaction (remove duplicate flag)</p></TooltipContent>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </TableCell>
                    <TableCell className="text-right">${tx.amount.toFixed(2)}</TableCell>
                    <TableCell><Badge variant="outline">{tx.category}</Badge></TableCell>
                    {columnVisibility.investor && <TableCell>{getInvestorName(tx.investorId)}</TableCell>}
                    {columnVisibility.property && <TableCell>{tx.property}</TableCell>}
                    {columnVisibility.unitNumber && <TableCell>{tx.unitNumber || '-'}</TableCell>}
                    {columnVisibility.cardUsed && <TableCell>{getCardName(tx.cardId)}</TableCell>}
                    {columnVisibility.recordedInBuildium && (
                      <TableCell>
                        <Badge
                          variant={tx.reconciled ? "default" : "secondary"}
                          className={cn(
                            IS_ADMIN ? "cursor-pointer" : "cursor-not-allowed opacity-70",
                            IS_ADMIN ? (tx.reconciled ? "bg-green-500 hover:bg-green-600 text-white" : "hover:bg-accent") : "",
                          )}
                          onClick={() => IS_ADMIN && handleToggleRecordedInBuildium(tx.id)}
                          title={IS_ADMIN ? (tx.reconciled ? "Mark as Not Recorded" : "Mark as Recorded in Buildium") : "Recorded in Buildium status"}
                        >
                          {tx.reconciled ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    )}
                    {columnVisibility.receiptImageURI && (
                      <TableCell>
                        {tx.receiptImageURI ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="cursor-default">
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" className="max-w-xs p-0 border-0 bg-transparent shadow-xl">
                              <Image
                                src={tx.receiptImageURI}
                                alt="Receipt"
                                width={200}
                                height={200}
                                className="rounded-md object-contain"
                                data-ai-hint="receipt image"
                              />
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    )}
                    {columnVisibility.sourceType && <TableCell>{tx.sourceType?.toUpperCase()}</TableCell>}
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleCopyDetails(tx.id)} title="Copy Details"><ClipboardCopy className="h-4 w-4" /></Button>
                        {IS_ADMIN && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(tx.id)} title="Edit Transaction"><Edit3 className="h-4 w-4" /></Button>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteToRecycleBin(tx.id)} title="Move to Deleted Items">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Move to Deleted Items</p></TooltipContent>
                            </Tooltip>
                            {/* Permanent delete moved to DeletedItemsTable 
                             <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => openPermanentDeleteDialog(tx.id)} title="Permanently Delete">
                                  <AlertCircle className="h-4 w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Permanently Delete Transaction</p></TooltipContent>
                            </Tooltip> */}
                          </>
                        )}
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
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the transaction from the system. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToPermanentlyDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDeleteConfirm}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
