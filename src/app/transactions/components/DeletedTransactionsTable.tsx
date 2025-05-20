
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Undo2, AlertCircle, Trash2 } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { 
  restoreTransactionFromMockData,
  getDeletedTransactions,
  permanentlyDeleteTransactionFromMockData 
} from "@/lib/mock-data"; 
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface DeletedTransactionsTableProps {
  initialDeletedTransactions: Transaction[]; 
}

const ADMIN_EMAIL = 'jessrafalfernandez@gmail.com';
const currentUsersEmail = 'jessrafalfernandez@gmail.com'; 
const IS_ADMIN = currentUsersEmail === ADMIN_EMAIL;

export function DeletedTransactionsTable({ initialDeletedTransactions }: DeletedTransactionsTableProps) {
  const [deletedTransactions, setDeletedTransactions] = React.useState<Transaction[]>(initialDeletedTransactions);
  const { toast } = useToast();
  const router = useRouter();

  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [transactionToPermanentlyDelete, setTransactionToPermanentlyDelete] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDeletedTransactions(initialDeletedTransactions);
  }, [initialDeletedTransactions]);

  const handleRestore = (id: string) => {
    if (!IS_ADMIN) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to restore transactions.",
        variant: "destructive",
      });
      return;
    }

    restoreTransactionFromMockData(id);
    setDeletedTransactions(getDeletedTransactions()); 
    
    toast({
      title: "Transaction Restored",
      description: `Transaction with ID ${id} has been restored to the active list.`,
    });
    // router.refresh(); // May not be needed if parent page handles refresh, or if onTransactionUpdate prop is used
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

  const handlePermanentDeleteConfirm = () => {
    if (transactionToPermanentlyDelete) {
      permanentlyDeleteTransactionFromMockData(transactionToPermanentlyDelete);
      setDeletedTransactions(getDeletedTransactions()); // Refresh the list
      toast({
        title: "Transaction Permanently Deleted",
        description: `Transaction has been permanently deleted.`,
      });
      setTransactionToPermanentlyDelete(null);
    }
    setIsAlertOpen(false);
  };


  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deletedTransactions.length > 0 ? (
                deletedTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{format(parseISO(tx.date), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="font-medium">{tx.vendor}</TableCell>
                    <TableCell className="text-right">${tx.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.category}</Badge>
                    </TableCell>
                    <TableCell>{tx.property}</TableCell>
                    <TableCell>
                      {IS_ADMIN ? (
                          <div className="flex space-x-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => handleRestore(tx.id)}>
                                        <Undo2 className="mr-2 h-4 w-4" />
                                        Restore
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Restore this transaction to active list</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => openPermanentDeleteDialog(tx.id)}
                                        className="text-destructive hover:text-destructive/80"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Permanently Delete Transaction</p></TooltipContent>
                            </Tooltip>
                          </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Admin only</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No deleted transactions found.
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
              className={buttonVariants({ variant: "destructive" })}
            >
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}

