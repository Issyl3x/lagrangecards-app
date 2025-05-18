
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cardSchema, type CardFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getMockInvestors, getMockProperties, addCard } from "@/lib/mock-data";
import type { Investor } from "@/lib/types";

interface AddCardFormProps {
  onCardAdded: () => void;
}

export function AddCardForm({ onCardAdded }: AddCardFormProps) {
  const { toast } = useToast();
  const [investors, setInvestors] = React.useState<Investor[]>([]);
  const [properties, setProperties] = React.useState<string[]>([]);

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardName: "",
      investorId: undefined,
      property: undefined,
      last4Digits: "",
      spendLimitMonthly: undefined,
    },
  });

  React.useEffect(() => {
    setInvestors(getMockInvestors());
    setProperties(getMockProperties());
  }, []);

  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = (data: CardFormValues) => {
    setIsLoading(true);
    try {
      const newCard = addCard({
        ...data,
        // spendLimitMonthly is already correctly a number or undefined due to schema
      });
      toast({
        title: "Card Added",
        description: `${newCard.cardName} has been added.`,
      });
      form.reset();
      onCardAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add card.",
        variant: "destructive",
      });
      console.error("Failed to add card:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an investor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {investors.map(investor => (
                      <SelectItem key={investor.id} value={investor.id}>{investor.name}</SelectItem>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {properties.map(property => (
                      <SelectItem key={property} value={property}>{property}</SelectItem>
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
                    value={field.value === undefined ? '' : String(field.value)} // Ensure value is string or empty
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') {
                        field.onChange(undefined);
                      } else {
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          field.onChange(num);
                        } else {
                          // Optionally, handle invalid input differently, e.g., keep old value or set to undefined
                          // For now, if it's not a number and not empty, react-hook-form will hold the invalid string
                          // and zod will catch it on submit. Or, to be stricter:
                           field.onChange(undefined); // Or field.onChange(field.value) to revert
                        }
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Card"}
        </Button>
      </form>
    </Form>
  );
}
