
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
  "Appliances": "hsl(var(--chart-5))",
  "Other": "hsl(var(--chart-5))",
};


export function SpendByCategoryChart({ transactions }: SpendByCategoryChartProps) {
  const spendByCategory: Record<string, number> = {};
  if (transactions && transactions.length > 0) {
    transactions.forEach(tx => {
      if (tx.category && typeof tx.amount === 'number') { // Basic validation
        spendByCategory[tx.category] = (spendByCategory[tx.category] || 0) + tx.amount;
      }
    });
  }

  const chartData = Object.entries(spendByCategory)
    .filter(([, value]) => value > 0)
    .map(([category, value], index) => ({
      category,
      value,
      fill: categoryColors[category] || `hsl(var(--chart-${(index % 5) + 1}))`,
    }));

  const currentChartConfig = chartData.reduce((acc, item) => {
    acc[item.category] = {
      label: item.category,
      color: item.fill,
    };
    return acc;
  }, {} as ChartConfig);

  // For debugging in browser console
  if (typeof window !== 'undefined') {
    console.log("[SpendByCategoryChart] Transactions received (length):", transactions?.length);
    console.log("[SpendByCategoryChart] spendByCategory calculated:", JSON.stringify(spendByCategory));
    console.log("[SpendByCategoryChart] chartData for pie (length):", chartData.length);
    console.log("[SpendByCategoryChart] chartData for pie (content):", JSON.stringify(chartData));
  }

  if (chartData.length === 0) {
    let descriptionText = "No transaction data available to display spend by category.";
    if (transactions && transactions.length > 0) {
      descriptionText = "Transactions are present, but no spend was recorded for any category, or amounts are not positive.";
    }
    return (
       <Card>
        <CardHeader>
          <CardTitle>Spend by Category</CardTitle>
          <CardDescription>{descriptionText}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground">No data to display in chart</p>
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
          <PieChart width={250} height={250}>
            {/* <ChartTooltip content={<ChartTooltipContent nameKey="category" />} /> */}
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8" /* Default fill if cell fill fails */
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            {/* <ChartLegend content={<ChartLegendContent nameKey="category" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" /> */}
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
