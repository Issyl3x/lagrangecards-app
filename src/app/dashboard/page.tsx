
import { TotalSpendCard } from "./components/TotalSpendCard";
import { SpendByCategoryChart } from "./components/SpendByCategoryChart";
import { MonthlySpendChart } from "./components/MonthlySpendChart";
import { AlertsList } from "./components/AlertsList";
import { getMockTransactions, mockCards } from "@/lib/mock-data"; // Using mock data for now
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  // In a real app, this data would be fetched
  const transactions = getMockTransactions();
  const cards = mockCards;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <TotalSpendCard transactions={transactions} />
        {/* Add more summary cards here if needed */}
      </div>
      
      <Separator />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <MonthlySpendChart transactions={transactions} />
        </div>
        <div className="lg:col-span-3">
          <SpendByCategoryChart transactions={transactions} />
        </div>
      </div>
      
      <Separator />
      
      <div>
        <AlertsList transactions={transactions} cards={cards} />
      </div>
    </div>
  );
}
