
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);

  React.useEffect(() => {
    const fetchCardDetails = async () => {
      if (cardId) {
        setIsFetching(true);
        try {
          const allCards = await getMockCards();
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
        } catch (error) {
          console.error("Error fetching card details:", error);
          toast({ title: "Error", description: "Could not load card details.", variant: "destructive" });
        } finally {
          setIsFetching(false);
        }
      }
    };
    fetchCardDetails();
  }, [cardId, router, toast]);

  const handleSubmit = async (data: CardFormValues) => {
    if (!IS_ADMIN) {
        toast({ title: "Permission Denied", description: "Editing cards is an administrator-only feature.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    
    const cardToUpdate: UserCard = {
        id: cardId, 
        ...data,
        isPersonal: false, // Assuming cards are not personal for this form
    };

    try {
      const success = await updateCard(cardToUpdate);
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
    } catch (error) {
      console.error("Error updating card:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
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
    // This case might be hit if fetching completes but no card was found (already handled by redirect)
    // or if the user is not admin and isFetching is false.
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
          isLoading={isSubmitting}
          isEditMode={true}
        />
      </CardContent>
    </Card>
  );
}
