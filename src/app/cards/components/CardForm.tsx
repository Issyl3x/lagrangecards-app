
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cardSchema, type CardFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMockInvestors, getMockProperties } from "@/lib/mock-data";
import type { Investor } from "@/lib/types";

interface CardFormProps {
  initialData?: CardFormValues;
  onSubmit: (data: CardFormValues) => Promise<void>; // onSubmit is now async
  isLoading?: boolean;
  isEditMode?: boolean;
}

export function CardForm({ initialData, onSubmit, isLoading, isEditMode = false }: CardFormProps) {
  const [investors, setInvestors] = React.useState<Investor[]>([]);
  const [properties, setProperties] = React.useState<string[]>([]);
  const [isFetchingDropdownData, setIsFetchingDropdownData] = React.useState(true);

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: initialData || {
      cardName: "",
      investorId: undefined,
      property: undefined,
      last4Digits: "",
      spendLimitMonthly: undefined,
    },
  });

  React.useEffect(() => {
    const fetchDropdownData = async () => {
      setIsFetchingDropdownData(true);
      try {
        const [investorsData, propertiesData] = await Promise.all([
          getMockInvestors(),
          getMockProperties()
        ]);
        setInvestors(investorsData);
        setProperties(propertiesData);
      } catch (error) {
        console.error("Error fetching dropdown data for CardForm:", error);
      } finally {
        setIsFetchingDropdownData(false);
      }
    };
    fetchDropdownData();
  }, []);

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);


  const handleSubmit = async (data: CardFormValues) => {
    await onSubmit(data); // Await the onSubmit prop
  };

  if (isFetchingDropdownData && !initialData) { // Only show loading if not in edit mode with initial data
    return <p>Loading form...</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="cardName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chase Sapphire - Main St Project" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="investorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Investor</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isFetchingDropdownData}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an investor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {investors.map((investor) => (
                      <SelectItem key={investor.id} value={investor.id}>
                        {investor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="property"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isFetchingDropdownData}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property} value={property}>
                        {property}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="last4Digits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last 4 Digits (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="spendLimitMonthly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Spend Limit (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="5000"
                    {...field}
                    value={field.value === undefined ? '' : String(field.value)}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? undefined : parseFloat(val));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading || isFetchingDropdownData}>
          {isLoading ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Card" : "Add Card")}
        </Button>
      </form>
    </Form>
  );
}
