
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
import { PieChart, Pie, Cell } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
// Removed useState and useEffect

interface SpendByCategoryChartProps {
  transactions: Transaction[];
}

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
  "Appliances": "hsl(var(--chart-5))", // Ensure Appliances is here if it's a category
  "Other": "hsl(var(--chart-5))", // Consider a different color or ensure it's distinct
};


export function SpendByCategoryChart({ transactions }: SpendByCategoryChartProps) {
  // Derive chartData and currentChartConfig directly from transactions prop
  const spendByCategory: Record<string, number> = {};
  transactions.forEach(tx => {
    spendByCategory[tx.category] = (spendByCategory[tx.category] || 0) + tx.amount;
  });

  const chartData = Object.entries(spendByCategory)
    .filter(([, value]) => value > 0) // Only include categories with spend > 0
    .map(([category, value], index) => ({
      category,
      value,
      fill: categoryColors[category] || `hsl(var(--chart-${(index % 5) + 1}))`, // Fallback color
    }));

  const currentChartConfig = chartData.reduce((acc, item) => {
    acc[item.category] = {
      label: item.category,
      color: item.fill,
    };
    return acc;
  }, {} as ChartConfig);
  

  if (chartData.length === 0) { // Check if there's any data to plot
    return (
       <Card>
        <CardHeader>
          <CardTitle>Spend by Category</CardTitle>
          <CardDescription>{transactions.length === 0 ? "No transaction data available." : "No spend recorded for any category in the current period."}</CardDescription>
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

