
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
// import { Switch } from "@/components/ui/switch"; // Removed Switch import for reconciled
import { cn } from "@/lib/utils";
import type { Transaction, Investor, Card as UserCard } from "@/lib/types";
import { mockInvestors, mockProjects, mockCards, mockCategories } from "@/lib/mock-data";
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
      date: initialData?.date ? parseISO(initialData.date) : new Date(),
      vendor: initialData?.vendor || "",
      description: initialData?.description || "",
      amount: initialData?.amount || 0,
      category: initialData?.category || "",
      cardId: initialData?.cardId || "",
      investorId: initialData?.investorId || "",
      project: initialData?.project || "",
      receiptLink: initialData?.receiptLink || "",
      // reconciled: initialData?.reconciled || false, // Reconciled is no longer managed by this form
      sourceType: initialData?.sourceType || 'manual',
    },
  });

  const [investors] = React.useState<Investor[]>(mockInvestors);
  const [projects] = React.useState<string[]>(mockProjects);
  const [cards, setCards] = React.useState<UserCard[]>(mockCards);
  const [categories] = React.useState<(string)[]>(mockCategories);

  const selectedInvestorId = form.watch("investorId");

  React.useEffect(() => {
    if (selectedInvestorId) {
      const investor = investors.find(inv => inv.id === selectedInvestorId);
      if (investor) form.setValue("investorName", investor.name);
      setCards(mockCards.filter(card => card.investorId === selectedInvestorId));
      // form.setValue("cardId", ""); // Reset card if investor changes
    } else {
      setCards(mockCards); // Show all cards if no investor selected, or handle as needed
      form.setValue("investorName", "");
    }
  }, [selectedInvestorId, form, investors]);

  React.useEffect(() => {
    if (initialData?.date) {
      const parsedDate = parseISO(initialData.date);
      if (isValid(parsedDate)) {
        form.setValue("date", parsedDate);
      }
    }
    if (initialData?.vendor) form.setValue("vendor", initialData.vendor);
    if (initialData?.amount) form.setValue("amount", initialData.amount);
    // if (typeof initialData?.reconciled === 'boolean') form.setValue("reconciled", initialData.reconciled); // No longer setting reconciled here
    // For other fields, defaultValues in useForm should handle them.
  }, [initialData, form]);


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
              <FormItem>
                <FormLabel>Vendor</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Home Depot" {...field} />
                </FormControl>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            name="project"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedInvestorId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project} value={project}>{project}</SelectItem>
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedInvestorId}>
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

