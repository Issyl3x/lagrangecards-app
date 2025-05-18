
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
import { CreditCardPaymentsList } from "./components/CreditCardPaymentsList"; // Import new component

export default function DashboardPage() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [cards, setCards] = React.useState<UserCard[]>([]);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fetchDashboardData = React.useCallback(() => {
    setTransactions(getMockTransactions());
    setCards(getMockCards());
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, pathname, searchParams]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <TotalSpendCard transactions={transactions} />
        {/* Add more summary cards here if needed */}
      </div>
      
      <PropertySpendSummary transactions={transactions} />
      
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
        <RecentTransactionsList transactions={transactions} itemsToShow={5} />
      </div>

      <Separator /> 

      <div>
        <CreditCardPaymentsList transactions={transactions} itemsToShow={5} />
      </div>
    </div>
  );
}
