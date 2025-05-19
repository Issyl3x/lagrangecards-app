
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { addCard, getMockCards, getMockInvestors } from "@/lib/mock-data";
import type { Investor, Card as UserCard } from "@/lib/types";
import type { CardFormValues } from "@/lib/schemas";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Edit3, CreditCardIcon } from "lucide-react";
import Link from "next/link";
import { CardForm } from "./components/CardForm";

// Define admin email and current user's email for permission check
const ADMIN_EMAIL = 'jessrafalfernandez@gmail.com';
// To test teammate view, change this to a non-admin email like 'teammate@example.com'
const currentUsersEmail = 'jessrafalfernandez@gmail.com'; 
const IS_ADMIN = currentUsersEmail === ADMIN_EMAIL;

export default function CardsPage() {
  const [cards, setCards] = React.useState<UserCard[]>([]);
  const [investors, setInvestors] = React.useState<Investor[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const refreshData = React.useCallback(() => {
    setCards(getMockCards());
    setInvestors(getMockInvestors());
  }, []);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleAddCard = (data: CardFormValues) => {
    setIsLoading(true);
    try {
      addCard(data);
      toast({ title: "Card Added", description: `${data.cardName} has been added.` });
      refreshData(); 
    } catch (error) {
      toast({ title: "Error", description: "Failed to add card.", variant: "destructive" });
      console.error("Failed to add card:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          {IS_ADMIN ? (
            <CardForm onSubmit={handleAddCard} isLoading={isLoading} />
          ) : (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Admin Access Required</AlertTitle>
              <AlertDescription>
                Adding new cards is an administrator-only feature.
              </AlertDescription>
            </Alert>
          )}
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
            <ul className="space-y-4">
              {cards.map(card => (
                <li key={card.id} className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center min-w-0">
                      <CreditCardIcon className="h-6 w-6 mr-3 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-lg text-primary truncate">{card.cardName}</p>
                        <p className="text-sm text-muted-foreground truncate">Property: {card.property}</p>
                        <p className="text-sm text-muted-foreground truncate">Investor: {getInvestorName(card.investorId)}</p>
                        {card.last4Digits && <p  className="text-sm text-muted-foreground truncate">Last 4: **** {card.last4Digits}</p>}
                        {card.spendLimitMonthly && <p className="text-sm text-muted-foreground truncate">Limit: ${card.spendLimitMonthly.toLocaleString()} / month</p>}
                      </div>
                    </div>
                    {IS_ADMIN && (
                      <Button asChild variant="outline" size="sm" className="ml-4 flex-shrink-0">
                        <Link href={`/cards/edit/${card.id}`}>
                          <Edit3 className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </Button>
                    )}
                  </div>
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
