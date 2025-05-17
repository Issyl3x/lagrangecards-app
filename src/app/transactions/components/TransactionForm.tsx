
"use client";

import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { Transaction, Investor, Card as UserCard } from "@/lib/types";
import { mockInvestors, mockProperties, mockCards, mockCategories, getMockTransactions } from "@/lib/mock-data";
import { format, parseISO, isValid } from "date-fns";
import * as React from "react";
import { transactionSchema } from '@/lib/schemas';

export type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  initialData?: Partial<Transaction>;
  onSubmit: (data: TransactionFormValues) => void;
  isLoading?: boolean;
}

export function TransactionForm({ initialData, onSubmit, isLoading }: TransactionFormProps) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: undefined, // Will be set by useEffect on client if no initialData.date
      vendor: initialData?.vendor || "",
      description: initialData?.description || "",
      amount: initialData?.amount || 0,
      category: initialData?.category || "",
      cardId: initialData?.cardId || "",
      investorId: initialData?.investorId || "",
      investorName: "",
      property: initialData?.property || "",
      receiptLink: initialData?.receiptLink || "",
      sourceType: initialData?.sourceType || 'manual',
    },
  });

  const [investors] = React.useState<Investor[]>(mockInvestors);
  const [properties] = React.useState<string[]>(mockProperties);
  const [cards, setCards] = React.useState<UserCard[]>(mockCards);
  const [categories] = React.useState<(string)[]>(mockCategories);

  const [isVendorPopoverOpen, setIsVendorPopoverOpen] = React.useState(false);
  const [uniqueVendors, setUniqueVendors] = React.useState<string[]>([]);

  React.useEffect(() => {
    const transactions = getMockTransactions();
    const vendors = Array.from(new Set(transactions.map(tx => tx.vendor).filter(Boolean).map(v => v.trim())))
                       .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    setUniqueVendors(vendors);
  }, []);

  React.useEffect(() => {
    if (initialData) {
      const investorName = initialData.investorId
        ? (investors.find(inv => inv.id === initialData.investorId)?.name || "")
        : "";
      
      const resetValues: TransactionFormValues = {
        date: initialData.date && isValid(parseISO(initialData.date)) ? parseISO(initialData.date) : new Date(),
        vendor: initialData.vendor || "",
        description: initialData.description || "",
        amount: initialData.amount || 0,
        category: initialData.category || "",
        cardId: initialData.cardId || "",
        investorId: initialData.investorId || "",
        investorName: investorName,
        property: initialData.property || "",
        receiptLink: initialData.receiptLink || "",
        sourceType: initialData.sourceType || 'manual',
      };
      form.reset(resetValues);

      if (initialData.investorId) {
        setCards(mockCards.filter(card => card.investorId === initialData.investorId));
      } else {
        setCards(mockCards);
      }
    }
  }, [initialData, form, investors]);

  React.useEffect(() => {
    if (!initialData?.date && form.getValues('date') === undefined) {
      form.setValue('date', new Date());
    }
  }, [initialData, form]);

  const selectedInvestorId = form.watch("investorId");

  React.useEffect(() => {
    if (selectedInvestorId) {
      const investor = investors.find(inv => inv.id === selectedInvestorId);
      if (investor) form.setValue("investorName", investor.name);
      
      const filteredCards = mockCards.filter(card => card.investorId === selectedInvestorId);
      setCards(filteredCards);
      
      const currentCardId = form.getValues("cardId");
      if (currentCardId && !filteredCards.find(card => card.id === currentCardId)) {
        form.setValue("cardId", "");
      }

    } else {
      form.setValue("investorName", "");
      setCards(mockCards);
    }
  }, [selectedInvestorId, form, investors]);


  function handleSubmit(data: TransactionFormValues) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
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
            name="vendor"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Vendor</FormLabel>
                <Popover open={isVendorPopoverOpen} onOpenChange={setIsVendorPopoverOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isVendorPopoverOpen}
                        className={cn(
                          "w-full justify-between font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        onClick={() => setIsVendorPopoverOpen(!isVendorPopoverOpen)}
                      >
                        {field.value || "Select or type vendor..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-[--radix-popover-trigger-width] p-0"
                    onCloseAutoFocus={(e) => e.preventDefault()} // Prevents re-focusing trigger
                  >
                    <Command>
                      <CommandInput
                        placeholder="Search or type new vendor..."
                        value={field.value || ''}
                        onValueChange={(currentValue) => {
                          field.onChange(currentValue);
                          if (!isVendorPopoverOpen && currentValue) setIsVendorPopoverOpen(true);
                        }}
                        ref={field.ref} // RHF ref
                        onBlur={field.onBlur} // RHF blur
                      />
                      <CommandList>
                        <CommandEmpty>
                          {field.value?.trim() ? (
                            <span>Press Enter or Tab to add "<strong>{field.value.trim()}</strong>"</span>
                          ) : (
                            "No results found. Type to add new."
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {uniqueVendors.map((vendorName) => (
                            <CommandItem
                              value={vendorName}
                              key={vendorName}
                              onSelect={() => {
                                form.setValue("vendor", vendorName, { shouldValidate: true });
                                setIsVendorPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  vendorName.toLowerCase() === (field.value || "").toLowerCase()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {vendorName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. Supplies for kitchen remodel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field}
                    onChange={event => field.onChange(+event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FormField
            control={form.control}
            name="investorId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Investor</FormLabel>
                 <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? investors.find(
                              (investor) => investor.id === field.value
                            )?.name
                          : "Select investor"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search investor..." />
                      <CommandList>
                        <CommandEmpty>No investor found.</CommandEmpty>
                        <CommandGroup>
                          {investors.map((investor) => (
                            <CommandItem
                              value={investor.name}
                              key={investor.id}
                              onSelect={() => {
                                form.setValue("investorId", investor.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  investor.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {investor.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedInvestorId && !initialData?.investorId}>
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

          <FormField
            control={form.control}
            name="cardId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Used</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedInvestorId && !initialData?.investorId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a card" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cards.map(card => (
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
        </div>

        <FormField
          control={form.control}
          name="receiptLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receipt Link (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://docs.google.com/..." {...field} />
              </FormControl>
              <FormDescription>Link to the receipt on Google Drive or other storage.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : (initialData?.id ? "Update Transaction" : "Save Transaction")}
        </Button>
      </form>
    </Form>
  );
}

    