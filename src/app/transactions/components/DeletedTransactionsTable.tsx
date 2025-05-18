
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Undo2 } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { 
  restoreTransactionFromMockData,
  getDeletedTransactions 
} from "@/lib/mock-data"; 
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface DeletedTransactionsTableProps {
  initialDeletedTransactions: Transaction[]; 
}

// Mock current user for permission check
const mockCurrentUser = {
  id: 'investor1', // Can be any ID for simulation
  isAdmin: false,  // Set to true for admin, false for non-admin
};

export function DeletedTransactionsTable({ initialDeletedTransactions }: DeletedTransactionsTableProps) {
  const [deletedTransactions, setDeletedTransactions] = React.useState<Transaction[]>(initialDeletedTransactions);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    setDeletedTransactions(initialDeletedTransactions);
  }, [initialDeletedTransactions]);

  const handleRestore = (id: string) => {
    if (!mockCurrentUser.isAdmin) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to restore transactions.",
        variant: "destructive",
      });
      return;
    }

    restoreTransactionFromMockData(id);
    setDeletedTransactions(getDeletedTransactions()); // Refresh local state from source
    
    toast({
      title: "Transaction Restored",
      description: `Transaction with ID ${id} has been restored to the active list.`,
    });
    router.refresh(); // Refresh data for other pages like the main transactions list
  };

  return (
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
                    {mockCurrentUser.isAdmin ? (
                        <Button variant="ghost" size="sm" onClick={() => handleRestore(tx.id)} title="Restore Transaction">
                            <Undo2 className="mr-2 h-4 w-4" />
                            Restore
                        </Button>
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
  );
}

