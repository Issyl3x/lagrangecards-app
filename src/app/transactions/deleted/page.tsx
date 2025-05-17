
import { DeletedTransactionsTable } from "../components/DeletedTransactionsTable";
import { getDeletedTransactions } from "@/lib/mock-data"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DeletedTransactionsPage() {
  const currentDeletedTransactions = getDeletedTransactions();

  return (
    <Card>
      <CardHeader>
          <CardTitle>Deleted Transactions</CardTitle>
          <CardDescription>View and restore transactions that have been deleted.</CardDescription>
      </CardHeader>
      <CardContent>
        <DeletedTransactionsTable initialDeletedTransactions={currentDeletedTransactions} />
      </CardContent>
    </Card>
  );
}
