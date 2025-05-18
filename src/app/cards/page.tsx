
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cardSchema, type CardFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { addCard, getMockCards, getMockInvestors, getMockProperties } from "@/lib/mock-data";
import type { Investor, Card as UserCard } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

// Mock current user for permission check
const mockCurrentUser = {
  id: 'user1', // Can be any ID for simulation
  isAdmin: false,  // Set to false to show restricted view
};

function AddCardForm({ onCardAdded }: { onCardAdded: () => void }) {
  const { toast } = useToast();
  const [investors, setInvestors] = React.useState<Investor[]>([]);
  const [properties, setProperties] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

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

  const onSubmit = (data: CardFormValues) => {
    setIsLoading(true);
    try {
      addCard(data);
      toast({ title: "Card Added", description: `${data.cardName} has been added.` });
      form.reset();
      onCardAdded();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add card.", variant: "destructive" });
      console.error("Failed to add card:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mockCurrentUser.isAdmin) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Admin Access Required</AlertTitle>
        <AlertDescription>
          Adding new cards is an administrator-only feature.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="cardName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Name</FormLabel>
              <FormControl><Input placeholder="e.g., Chase Sapphire - Main St Project" {...field} /></FormControl>
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
                  <FormControl><SelectTrigger><SelectValue placeholder="Select an investor" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {investors.map(investor => <SelectItem key={investor.id} value={investor.id}>{investor.name}</SelectItem>)}
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
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a property" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {properties.map(property => <SelectItem key={property} value={property}>{property}</SelectItem>)}
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
                <FormControl><Input placeholder="1234" {...field} /></FormControl>
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
                    onChange={e => {
                      const val = e.target.value;
                      field.onChange(val === '' ? undefined : parseFloat(val));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Add Card"}</Button>
      </form>
    </Form>
  );
}

export default function CardsPage() {
  const [cards, setCards] = React.useState<UserCard[]>([]);
  const [investors, setInvestors] = React.useState<Investor[]>([]);


  const refreshCards = React.useCallback(() => {
    setCards(getMockCards());
    setInvestors(getMockInvestors()); // Also refresh investors for name lookup
  }, []);

  React.useEffect(() => {
    refreshCards();
  }, [refreshCards]);

  const getInvestorName = (investorId: string) => {
    return investors.find(inv => inv.id === investorId)?.name || 'N/A';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Card</CardTitle>
          <CardDescription>Enter the details for a new card.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddCardForm onCardAdded={refreshCards} />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Current Cards</CardTitle>
          <CardDescription>List of all registered cards.</CardDescription>
        </CardHeader>
        <CardContent>
          {cards.length > 0 ? (
            <ul className="space-y-2">
              {cards.map(card => (
                <li key={card.id} className="p-3 border rounded-md text-sm">
                  <p className="font-medium text-base">{card.cardName}</p>
                  <p>Property: <span className="font-normal text-muted-foreground">{card.property}</span></p>
                  <p>Investor: <span className="font-normal text-muted-foreground">{getInvestorName(card.investorId)}</span></p>
                  {card.last4Digits && <p>Last 4: <span className="font-normal text-muted-foreground">**** {card.last4Digits}</span></p>}
                  {card.spendLimitMonthly && <p>Limit: <span className="font-normal text-muted-foreground">${card.spendLimitMonthly.toLocaleString()} / month</span></p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No cards found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
