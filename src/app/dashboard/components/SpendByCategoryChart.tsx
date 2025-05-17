
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { Transaction } from "@/lib/types";
// import { getMockTransactions } from "@/lib/mock-data"; // No longer needed here directly
import { PieChart, Pie, Cell } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { useState, useEffect } from "react";

interface SpendByCategoryChartProps {
  transactions: Transaction[];
}

const initialChartConfig: ChartConfig = {};

const categoryColors: Record<string, string> = {
  "Repairs": "hsl(var(--chart-1))",
  "Utilities": "hsl(var(--chart-2))",
  "Supplies": "hsl(var(--chart-3))",
  "Mortgage": "hsl(var(--chart-4))",
  "Insurance": "hsl(var(--chart-5))",
  "HOA Fees": "hsl(var(--chart-1))", 
  "Property Management": "hsl(var(--chart-2))",
  "Travel": "hsl(var(--chart-3))",
  "Marketing": "hsl(var(--chart-4))",
  "Other": "hsl(var(--chart-5))",
};


export function SpendByCategoryChart({ transactions }: SpendByCategoryChartProps) {
  const [chartData, setChartData] = useState<{ category: string; value: number; fill: string }[]>([]);
  const [currentChartConfig, setCurrentChartConfig] = useState(initialChartConfig);

  useEffect(() => {
    const spendByCategory: Record<string, number> = {};
    // Use the passed 'transactions' prop
    transactions.forEach(tx => {
      spendByCategory[tx.category] = (spendByCategory[tx.category] || 0) + tx.amount;
    });

    const newChartData = Object.entries(spendByCategory).map(([category, value], index) => ({
      category,
      value,
      fill: categoryColors[category] || `hsl(var(--chart-${(index % 5) + 1}))`, // Fallback color
    }));

    const newChartConfig = newChartData.reduce((acc, item) => {
      acc[item.category] = {
        label: item.category,
        color: item.fill,
      };
      return acc;
    }, {} as ChartConfig);
    
    setChartData(newChartData);
    setCurrentChartConfig(newChartConfig);

  }, [transactions]);
  

  if (chartData.length === 0 && transactions.length === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Spend by Category</CardTitle>
          <CardDescription>No transaction data available for this period.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground">No data to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spend by Category</CardTitle>
        <CardDescription>Breakdown of expenses by category for the current period.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer config={currentChartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="category" labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.category}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="category" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
