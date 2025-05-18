
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend, // This is RechartsPrimitive.Legend
  ChartLegendContent, // This is the custom ShadCN component
} from "@/components/ui/chart";
import type { Transaction } from "@/lib/types";
import { PieChart, Pie, Cell, LabelList } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Filter } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";

interface SpendByCategoryChartProps {
  transactions: Transaction[];
}

const categoryColors: Record<string, string> = {
  "Repairs": "hsl(var(--chart-1))",
  "Utilities": "hsl(var(--chart-2))",
  "Supplies": "hsl(var(--chart-3))",
  "Mortgage": "hsl(var(--chart-4))",
  "Insurance": "hsl(var(--chart-5))",
  "HOA Fees": "hsl(var(--chart-1))", // Re-using colors
  "Property Management": "hsl(var(--chart-2))",
  "Travel": "hsl(var(--chart-3))",
  "Marketing": "hsl(var(--chart-4))",
  "Appliances": "hsl(var(--chart-5))",
  "Other": "hsl(var(--chart-5))",
};

export function SpendByCategoryChart({ transactions: allTransactions }: SpendByCategoryChartProps) {
  const [dateRangeFilter, setDateRangeFilter] = React.useState<DateRange | undefined>(undefined);

  const filteredTransactions = React.useMemo(() => {
    if (!dateRangeFilter?.from) {
      return allTransactions;
    }
    return allTransactions.filter(tx => {
      const txDate = parseISO(tx.date);
      const fromDate = dateRangeFilter.from as Date;
      let inRange = txDate >= fromDate;
      if (dateRangeFilter.to) {
        const toDate = new Date(dateRangeFilter.to as Date);
        toDate.setDate(toDate.getDate() + 1); // Include the 'to' date
        inRange = inRange && txDate < toDate;
      }
      return inRange;
    });
  }, [allTransactions, dateRangeFilter]);

  const spendByCategory: Record<string, number> = {};
  if (filteredTransactions && filteredTransactions.length > 0) {
    filteredTransactions.forEach(tx => {
      if (tx.category && typeof tx.amount === 'number') {
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

  if (typeof window !== 'undefined') {
    console.log("[SpendByCategoryChart] All Transactions (length):", allTransactions?.length);
    console.log("[SpendByCategoryChart] Date Range Filter:", dateRangeFilter);
    console.log("[SpendByCategoryChart] Filtered Transactions (length):", filteredTransactions?.length);
    console.log("[SpendByCategoryChart] spendByCategory calculated:", JSON.stringify(spendByCategory));
    console.log("[SpendByCategoryChart] chartData for pie (length):", chartData.length);
    console.log("[SpendByCategoryChart] chartData for pie (content):", JSON.stringify(chartData));
  }


  let descriptionText = "Breakdown of expenses by category.";
  if (dateRangeFilter?.from) {
    descriptionText += ` From ${format(dateRangeFilter.from, "LLL dd, y")}`;
    if (dateRangeFilter.to) {
      descriptionText += ` to ${format(dateRangeFilter.to, "LLL dd, y")}.`;
    }
  } else {
    descriptionText += " For all transactions.";
  }

  if (chartData.length === 0) {
    let emptyDataDescription = "No transaction data available for the selected period.";
    if (allTransactions && allTransactions.length > 0 && filteredTransactions.length === 0 && dateRangeFilter?.from) {
      emptyDataDescription = "No transactions found for the selected date range.";
    } else if (allTransactions && allTransactions.length > 0 && chartData.length === 0) {
      emptyDataDescription = "Transactions are present, but no spend was recorded for any category in the selected period, or amounts are not positive.";
    }
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle>Spend by Category</CardTitle>
              <CardDescription>{emptyDataDescription}</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto text-sm font-normal">
                  <Filter className="mr-2 h-4 w-4" />
                  {dateRangeFilter?.from ? (
                    dateRangeFilter.to ? (
                      <>
                        {format(dateRangeFilter.from, "LLL dd, y")} - {format(dateRangeFilter.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRangeFilter.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Filter by Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRangeFilter?.from}
                  selected={dateRangeFilter}
                  onSelect={setDateRangeFilter}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No data to display in chart</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>Spend by Category</CardTitle>
            <CardDescription>{descriptionText}</CardDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto text-sm font-normal">
                <Filter className="mr-2 h-4 w-4" />
                {dateRangeFilter?.from ? (
                  dateRangeFilter.to ? (
                    <>
                      {format(dateRangeFilter.from, "LLL dd, y")} - {format(dateRangeFilter.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRangeFilter.from, "LLL dd, y")
                  )
                ) : (
                  <span>Filter by Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRangeFilter?.from}
                selected={dateRangeFilter}
                onSelect={setDateRangeFilter}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <ChartContainer config={currentChartConfig} className="h-[300px] w-full max-w-[400px]"> {/* Adjusted height for legend */}
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="category" />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
              labelLine={false}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.category}`} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="category"
                position="outside"
                offset={15}
                formatter={(value: string, entry: any) => {
                  const percentage = entry.payload.percent;
                  if (percentage * 100 < 5) return null; // Hide label if too small
                  return `${value} (${(percentage * 100).toFixed(0)}%)`;
                }}
                className="text-xs fill-muted-foreground"
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="category" className="flex-wrap justify-center gap-x-4 gap-y-1" />}
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: '10px' }} // Add some space above the legend
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
