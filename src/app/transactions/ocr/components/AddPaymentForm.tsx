
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentFormSchema, type PaymentFormValues } from "@/lib/schemas";
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
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Card as UserCard, Transaction } from "@/lib/types";
import { getMockCards, addTransactionToMockData } from "@/lib/mock-data";
import { format, isValid, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

const ADMIN_EMAIL_PAYMENT_FORM = 'jessrafalfernandez@gmail.com';
const currentUsersEmailPaymentForm = ADMIN_EMAIL_PAYMENT_FORM;

export function AddPaymentForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [cards, setCards] = React.useState<UserCard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = React.useState(true);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardId: undefined,
      date: new Date(),
      amount: undefined,
      bankAccountUsed: "",
      note: "",
    },
  });

  React.useEffect(() => {
    const fetchCards = async () => {
      setIsLoadingCards(true);
      try {
        const cardsData = await getMockCards();
        setCards(cardsData);
      } catch (error) {
        console.error("Error fetching cards for payment form:", error);
      } finally {
        setIsLoadingCards(false);
      }
    };
    fetchCards();
  }, []);

  const onSubmit = async (data: PaymentFormValues) => {
    setIsSubmitting(true);

    const selectedCard = cards.find(card => card.id === data.cardId);
    if (!selectedCard) {
      toast({
        title: "Error",
        description: "Selected card not found. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const newPaymentTransaction: Transaction = {
      id: uuidv4(),
      date: format(data.date, "yyyy-MM-dd"),
      vendor: data.bankAccountUsed, 
      description: data.note || `Payment to ${selectedCard.cardName}${selectedCard.last4Digits ? ` (****${selectedCard.last4Digits})` : ''}`,
      amount: data.amount,
      category: "Credit Card Payment",
      cardId: selectedCard.id, 
      investorId: selectedCard.investorId,
      property: selectedCard.property, 
      unitNumber: "", 
      receiptImageURI: "", 
      reconciled: false, // Payments usually need to be reconciled
      sourceType: 'manual',
    };

    try {
        await addTransactionToMockData(newPaymentTransaction, currentUsersEmailPaymentForm); 

        toast({
        title: "Payment Saved",
        description: `Payment of $${data.amount.toFixed(2)} to ${selectedCard.cardName} has been recorded.`,
        });
        
        form.reset({
            cardId: undefined,
            date: new Date(),
            amount: undefined,
            bankAccountUsed: "",
            note: "",
        });
    } catch (error) {
        console.error("Error saving payment transaction:", error);
        toast({ title: "Error", description: "Failed to save payment.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoadingCards) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <span>Loading card options...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="cardId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Paid</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the card that received payment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.cardName}{card.last4Digits ? ` (****${card.last4Digits})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Payment Date</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(field.value, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Amount Paid</FormLabel>
                    <FormControl>
                    <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field}
                        value={field.value === undefined ? '' : String(field.value)} 
                        onChange={event => {
                        const value = event.target.value;
                        if (value === '' || value === null || value === undefined) {
                            field.onChange(undefined); 
                        } else {
                            const numericValue = parseFloat(value);
                            field.onChange(isNaN(numericValue) ? undefined : numericValue);
                        }
                        }}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="bankAccountUsed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account Used for Payment</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chase Checking (...1234)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Payment for statement ending May 2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || isLoadingCards}>
          {isSubmitting ? "Saving Payment..." : "Add Payment"}
        </Button>
      </form>
    </Form>
  );
}
