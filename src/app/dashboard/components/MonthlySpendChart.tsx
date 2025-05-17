
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import type { Transaction } from "@/lib/types";
// import { getMockTransactions } from "@/lib/mock-data"; // No longer needed here directly if passed as prop
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";
import { format, parseISO, subMonths, startOfMonth } from "date-fns"; // Combined imports
import { useState, useEffect } from "react";

interface MonthlySpendChartProps {
  transactions: Transaction[];
}

const chartConfig = {
  spend: {
    label: "Spend",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function MonthlySpendChart({ transactions }: MonthlySpendChartProps) {
  const [chartData, setChartData] = useState<{ month: string; spend: number }[]>([]);

  useEffect(() => {
    const monthlySpend: Record<string, number> = {};
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

    // Use the passed 'transactions' prop
    transactions.forEach(tx => {
      const txDate = parseISO(tx.date);
      if (txDate >= sixMonthsAgo) {
        const monthKey = format(txDate, "MMM yyyy");
        monthlySpend[monthKey] = (monthlySpend[monthKey] || 0) + tx.amount;
      }
    });

    const lastSixMonthsData: { month: string; spend: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, "MMM yyyy");
      lastSixMonthsData.push({
        month: monthKey,
        spend: monthlySpend[monthKey] || 0,
      });
    }
    
    setChartData(lastSixMonthsData);

  }, [transactions]);


  if (chartData.length === 0 && transactions.length === 0) { // Check if original transactions were also empty
     return (
       <Card>
        <CardHeader>
          <CardTitle>Monthly Spend Trend</CardTitle>
          <CardDescription>No transaction data available for the past 6 months.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No data to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Spend Trend</CardTitle>
        <CardDescription>Total spend over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={chartData} margin={{ left: 12, right: 12, top: 5, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickFormatter={(value) => `$${value / 1000}k`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="spend"
              type="monotone"
              stroke="var(--color-spend)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
