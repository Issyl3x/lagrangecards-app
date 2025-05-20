
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatementUploadForm } from "./components/StatementUploadForm";
import type { Transaction } from "@/lib/types";
import { getMockTransactions, updateTransactionInMockData } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { format, parseISO, differenceInDays, parse } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface StatementTransaction {
  id: string; // A unique ID for the list, e.g., "stmt-0", "stmt-1"
  date: Date;
  description: string;
  amount: number; // Positive for charges, negative for payments/credits on statement
  isReconciled: boolean;
}

export default function ReconcileTransactionsPage() {
  const [statementTransactions, setStatementTransactions] = React.useState<StatementTransaction[]>([]);
  const [appTransactions, setAppTransactions] = React.useState<Transaction[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    // Fetch only unreconciled transactions from the app
    setAppTransactions(getMockTransactions().filter(tx => !tx.reconciled));
  }, []);

  const handleStatementParsed = (parsedStatementTxs: StatementTransaction[]) => {
    setStatementTransactions(parsedStatementTxs);
  };

  const findPotentialMatches = (stmtTx: StatementTransaction): Transaction[] => {
    return appTransactions.filter(appTx => {
      if (appTx.reconciled) return false; // Should already be filtered, but good to double check

      const dateDiff = Math.abs(differenceInDays(stmtTx.date, parseISO(appTx.date)));
      const amountMatches = Math.abs(Math.abs(stmtTx.amount) - appTx.amount) < 0.01; // Compare absolute values, allow for small differences

      // Basic description match (can be improved)
      // For credit card statements, vendor is usually in description
      const descriptionInAppTxVendor = appTx.vendor.toLowerCase().includes(stmtTx.description.toLowerCase().substring(0,10));
      const descriptionInAppTxDesc = appTx.description.toLowerCase().includes(stmtTx.description.toLowerCase().substring(0,10));


      return dateDiff <= 3 && amountMatches && (descriptionInAppTxVendor || descriptionInAppTxDesc || stmtTx.description.toLowerCase().includes(appTx.vendor.toLowerCase()));
    });
  };

  const handleMatchTransaction = (stmtTxId: string, appTxId: string) => {
    const appTxToUpdate = appTransactions.find(tx => tx.id === appTxId);
    if (appTxToUpdate) {
      updateTransactionInMockData({ ...appTxToUpdate, reconciled: true });
      
      // Update statement transaction status locally
      setStatementTransactions(prevStmtTxs => 
        prevStmtTxs.map(st => st.id === stmtTxId ? { ...st, isReconciled: true } : st)
      );
      // Refresh app transactions list to remove the reconciled one
      setAppTransactions(prevAppTxs => prevAppTxs.filter(tx => tx.id !== appTxId));

      toast({
        title: "Transaction Matched",
        description: `App transaction for ${appTxToUpdate.vendor} has been marked as recorded.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Statement for Reconciliation</CardTitle>
          <CardDescription>
            Upload a CSV file of your bank or credit card statement.
            Expected columns: Date, Description, Amount.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatementUploadForm onStatementParsed={handleStatementParsed} />
        </CardContent>
      </Card>

      {statementTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reconcile Statement Transactions</CardTitle>
            <CardDescription>
              Review statement items and match them with your recorded transactions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statementTransactions.map((stmtTx) => {
              const potentialMatches = stmtTx.isReconciled ? [] : findPotentialMatches(stmtTx);
              return (
                <div key={stmtTx.id} className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        {format(stmtTx.date, "MMM dd, yyyy")} - {stmtTx.description}
                      </p>
                      <p className={`text-sm font-medium ${stmtTx.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Amount: ${Math.abs(stmtTx.amount).toFixed(2)} {stmtTx.amount < 0 ? "(Credit)" : "(Debit)"}
                      </p>
                    </div>
                    {stmtTx.isReconciled ? (
                       <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Matched
                       </Badge>
                    ) : (
                       <Badge variant="secondary">
                          <AlertCircle className="mr-2 h-4 w-4 text-orange-500" /> Unmatched
                       </Badge>
                    )}
                  </div>

                  {!stmtTx.isReconciled && potentialMatches.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-primary/50">
                      <p className="text-sm font-medium text-primary mb-1">Potential App Matches:</p>
                      <ul className="space-y-2">
                        {potentialMatches.map(appTx => (
                          <li key={appTx.id} className="p-2 border rounded-md bg-muted/50">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-semibold">{appTx.vendor} - ${appTx.amount.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(appTx.date), "MMM dd, yyyy")} - {appTx.description || appTx.category}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMatchTransaction(stmtTx.id, appTx.id)}
                              >
                                Match & Mark Recorded
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!stmtTx.isReconciled && potentialMatches.length === 0 && (
                    <p className="mt-2 text-sm text-muted-foreground pl-4">No immediate matches found in unreconciled app transactions.</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
