
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { CardForm } from "../../components/CardForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getMockCards, updateCard, getMockInvestors, getMockProperties } from "@/lib/mock-data";
import type { Card as UserCard, Investor } from "@/lib/types";
import type { CardFormValues } from "@/lib/schemas";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

const ADMIN_EMAIL = 'jessrafalfernandez@gmail.com';
const currentUsersEmail = 'jessrafalfernandez@gmail.com'; 
const IS_ADMIN = currentUsersEmail === ADMIN_EMAIL;

export default function EditCardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const cardId = params.id as string;

  const [cardForForm, setCardForForm] = React.useState<CardFormValues | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);

  React.useEffect(() => {
    if (cardId) {
      const allCards = getMockCards();
      const foundCard = allCards.find(c => c.id === cardId);
      if (foundCard) {
        setCardForForm({
          cardName: foundCard.cardName,
          investorId: foundCard.investorId,
          property: foundCard.property,
          last4Digits: foundCard.last4Digits || "",
          spendLimitMonthly: foundCard.spendLimitMonthly,
        });
      } else {
        toast({
          title: "Error",
          description: "Card not found.",
          variant: "destructive",
        });
        router.push("/cards");
      }
      setIsFetching(false);
    }
  }, [cardId, router, toast]);

  const handleSubmit = async (data: CardFormValues) => {
    if (!IS_ADMIN) {
        toast({ title: "Permission Denied", description: "Editing cards is an administrator-only feature.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    
    const cardToUpdate: UserCard = {
        id: cardId, 
        ...data,
        isPersonal: false, 
    };

    const success = updateCard(cardToUpdate);

    if (success) {
      toast({
        title: "Card Updated",
        description: `Card "${data.cardName}" has been updated.`,
      });
      router.push("/cards");
    } else {
      toast({
        title: "Error",
        description: "Failed to update card. It might have been deleted.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  if (!IS_ADMIN && !isFetching) { 
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Card</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Admin Access Required</AlertTitle>
            <AlertDescription>
              Editing cards is an administrator-only feature.
            </AlertDescription>
          </Alert>
           <Button onClick={() => router.push("/cards")} className="mt-4">
            Back to Cards
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading card details...</p>
      </div>
    );
  }

  if (!cardForForm) { 
    return (
      <Card>
        <CardHeader>
          <CardTitle>Card Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The card you are trying to edit could not be found.</p>
          <Button onClick={() => router.push("/cards")} className="mt-4">
            Back to Cards
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Card</CardTitle>
        <CardDescription>Update the details for this card.</CardDescription>
      </CardHeader>
      <CardContent>
        <CardForm 
          initialData={cardForForm} 
          onSubmit={handleSubmit} 
          isLoading={isLoading}
          isEditMode={true}
        />
      </CardContent>
    </Card>
  );
}
