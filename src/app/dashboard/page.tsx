
"use client";

import * as React from "react";
import { TotalSpendCard } from "./components/TotalSpendCard";
import { SpendByCategoryChart } from "./components/SpendByCategoryChart";
import { MonthlySpendChart } from "./components/MonthlySpendChart";
import { AlertsList } from "./components/AlertsList";
import { getMockTransactions, mockCards as getMockCards } from "@/lib/mock-data";
import { Separator } from "@/components/ui/separator";
import { usePathname, useSearchParams } from 'next/navigation';
import type { Transaction, Card as UserCard } from "@/lib/types";

export default function DashboardPage() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [cards, setCards] = React.useState<UserCard[]>([]);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fetchDashboardData = React.useCallback(() => {
    // console.log("DashboardPage: Fetching dashboard data");
    setTransactions(getMockTransactions());
    setCards(getMockCards); // Assuming mockCards is stable or also fetched if dynamic
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, pathname, searchParams]); // Re-fetch on navigation

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
