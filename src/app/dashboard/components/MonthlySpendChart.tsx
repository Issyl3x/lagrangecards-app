
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import type { Transaction } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, parseISO, subMonths, startOfMonth } from "date-fns";
// Removed useState and useEffect

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
  // Derive chartData directly from transactions prop
  const monthlySpend: Record<string, number> = {};
  const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

  transactions.forEach(tx => {
    const txDate = parseISO(tx.date);
    if (txDate >= sixMonthsAgo) {
      const monthKey = format(txDate, "MMM yyyy");
      monthlySpend[monthKey] = (monthlySpend[monthKey] || 0) + tx.amount;
    }
  });

  const chartData: { month: string; spend: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthKey = format(date, "MMM yyyy");
    chartData.push({
      month: monthKey,
      spend: monthlySpend[monthKey] || 0,
    });
  }
    
  if (transactions.length === 0) { 
     return (
       <Card>
        <CardHeader>
          <CardTitle>Monthly Spend Trend</CardTitle>
          <CardDescription>No transaction data available.</CardDescription>
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
              domain={[0, 'dataMax + 1000']} // Ensure Y-axis starts at 0 and has some padding
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

