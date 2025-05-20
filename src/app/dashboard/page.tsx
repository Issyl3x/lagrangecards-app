
"use client";

import * as React from "react";
import { TotalSpendCard } from "./components/TotalSpendCard";
import { SpendByCategoryChart } from "./components/SpendByCategoryChart";
import { MonthlySpendChart } from "./components/MonthlySpendChart";
import { getMockTransactions, getMockCards } from "@/lib/mock-data";
import { Separator } from "@/components/ui/separator";
import { usePathname, useSearchParams } from 'next/navigation';
import type { Transaction, Card as UserCard } from "@/lib/types";
import { PropertySpendSummary } from "./components/PropertySpendSummary";
import { RecentTransactionsList } from "./components/RecentTransactionsList";
import { CreditCardPaymentsList } from "./components/CreditCardPaymentsList"; 

export default function DashboardPage() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [cards, setCards] = React.useState<UserCard[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fetchDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [transactionsData, cardsData] = await Promise.all([
        getMockTransactions(),
        getMockCards()
      ]);
      setTransactions(transactionsData);
      setCards(cardsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Optionally set an error state here
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, pathname, searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <TotalSpendCard transactions={transactions} />
        {/* Add more summary cards here if needed */}
      </div>
      
      <Separator /> 
      
      <PropertySpendSummary transactions={transactions} />
      
      <Separator />

      <div>
        <RecentTransactionsList transactions={transactions} itemsToShow={5} />
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
        <CreditCardPaymentsList transactions={transactions} itemsToShow={5} />
      </div>
    </div>
  );
}
