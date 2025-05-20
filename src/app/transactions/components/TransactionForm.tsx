
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
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
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
import { 
  getMockInvestors, 
  getMockProperties, 
  getMockCards, 
  mockCategories, 
  getMockTransactions 
} from "@/lib/mock-data";
import { format, parseISO, isValid } from "date-fns";
import * as React from "react";
import { transactionSchema } from '@/lib/schemas';
import Image from "next/image";
import dynamic from 'next/dynamic';

const Calendar = dynamic(() => import('@/components/ui/calendar').then(mod => mod.Calendar), { 
  ssr: false,
  loading: () => <p>Loading Calendar...</p> 
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  initialData?: Partial<Transaction>;
  onSubmit: (data: TransactionFormValues) => Promise<void>; // onSubmit is now async
  isLoading?: boolean;
}

export function TransactionForm({ initialData, onSubmit, isLoading }: TransactionFormProps) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: undefined, 
      vendor: initialData?.vendor || "",
      description: initialData?.description || "",
      amount: initialData?.amount || undefined, 
      category: initialData?.category || "",
      cardId: initialData?.cardId || "",
      investorId: initialData?.investorId || "",
      investorName: "",
      property: initialData?.property || "",
      unitNumber: initialData?.unitNumber || "", 
      receiptImageURI: initialData?.receiptImageURI || "", 
      sourceType: initialData?.sourceType || 'manual',
    },
  });

  const [investors, setInvestors] = React.useState<Investor[]>([]);
  const [properties, setProperties] = React.useState<string[]>([]);
  const [cards, setCards] = React.useState<UserCard[]>([]);
  const [categories] = React.useState<(string)[]>(mockCategories);
  const [isFetchingDropdownData, setIsFetchingDropdownData] = React.useState(true);

  const [isVendorPopoverOpen, setIsVendorPopoverOpen] = React.useState(false);
  const [uniqueVendors, setUniqueVendors] = React.useState<string[]>([]);
  const [imagePreview, setImagePreview] = React.useState<string | null>(initialData?.receiptImageURI || null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchDropdownData = async () => {
      setIsFetchingDropdownData(true);
      try {
        const [investorsData, propertiesData, allCardsData, transactionsData] = await Promise.all([
          getMockInvestors(),
          getMockProperties(),
          getMockCards(),
          getMockTransactions()
        ]);
        setInvestors(investorsData);
        setProperties(propertiesData);
        setCards(allCardsData); 

        const vendors = Array.from(new Set(transactionsData.map(tx => tx.vendor).filter(Boolean).map(v => v.trim())))
                           .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        setUniqueVendors(vendors);

      } catch (error) {
        console.error("Error fetching dropdown data for TransactionForm:", error);
      } finally {
        setIsFetchingDropdownData(false);
      }
    };
    fetchDropdownData();
  }, []);

  React.useEffect(() => {
    const setupForm = async () => {
      if (initialData) {
        let investorName = "";
        if (initialData.investorId) {
          const currentInvestors = investors.length > 0 ? investors : await getMockInvestors();
          investorName = currentInvestors.find(inv => inv.id === initialData.investorId)?.name || "";
        }
        
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
          unitNumber: initialData.unitNumber || "", 
          receiptImageURI: initialData.receiptImageURI || "",
          sourceType: initialData.sourceType || 'manual',
        };
        form.reset(resetValues);
        setImagePreview(initialData.receiptImageURI || null);
        setFileName(null); 

        if (initialData.investorId) {
          const allCards = cards.length > 0 ? cards : await getMockCards();
          setCards(allCards.filter(card => card.investorId === initialData.investorId));
        }
      } else if (form.getValues('date') === undefined) {
         form.setValue('date', new Date());
      }
    };
    if (!isFetchingDropdownData) { // Ensure dropdown data is loaded before setting up form with initialData
        setupForm();
    }
  }, [initialData, form, isFetchingDropdownData, investors, cards]);


  const selectedInvestorId = form.watch("investorId");

  React.useEffect(() => {
    const updateCardsForInvestor = async () => {
      const allCards = cards.length > 0 ? cards : await getMockCards(); // Use state if populated, else fetch
      const currentInvestors = investors.length > 0 ? investors : await getMockInvestors();

      if (selectedInvestorId) {
        const investor = currentInvestors.find(inv => inv.id === selectedInvestorId);
        if (investor) form.setValue("investorName", investor.name);
        
        const filteredCards = allCards.filter(card => card.investorId === selectedInvestorId);
        setCards(filteredCards); // Update the cards state for the dropdown
        
        const currentCardId = form.getValues("cardId");
        if (currentCardId && !filteredCards.find(card => card.id === currentCardId)) {
          form.setValue("cardId", ""); // Clear card if no longer valid for selected investor
        }
      } else {
        form.setValue("investorName", "");
        setCards(allCards); // Show all cards if no investor selected
      }
    };
    if (!isFetchingDropdownData) {
        updateCardsForInvestor();
    }
  }, [selectedInvestorId, form, isFetchingDropdownData, investors, cards]); // Added cards and investors as dependencies


  async function handleSubmit(data: TransactionFormValues) {
    await onSubmit(data);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        form.setValue("receiptImageURI", dataUri, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    } else {
      setFileName(null);
      setImagePreview(null);
      form.setValue("receiptImageURI", "", { shouldValidate: true });
    }
  };

  if (isFetchingDropdownData) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading form data...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Date and Vendor Fields */}
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
                    onCloseAutoFocus={(e) => e.preventDefault()} 
                  >
                    <Command>
                      <CommandInput
                        placeholder="Search or type new vendor..."
                        value={field.value || ''}
                        onValueChange={(currentValue) => {
                          field.onChange(currentValue);
                          if (!isVendorPopoverOpen && currentValue) setIsVendorPopoverOpen(true);
                        }}
                        ref={field.ref} 
                        onBlur={(e) => {
                          field.onBlur();
                        }}
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

        {/* Description Field */}
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
        
        {/* Amount and Category Fields */}
        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
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
                        if (isNaN(numericValue)) {
                          field.onChange(undefined); 
                        } else {
                          field.onChange(numericValue); 
                        }
                      }
                    }}
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

        {/* Investor, Property, Unit #, Card Used Fields */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
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
                        disabled={isFetchingDropdownData}
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
                <Select onValueChange={field.onChange} value={field.value} disabled={isFetchingDropdownData || (!selectedInvestorId && !initialData?.investorId)}>
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
            name="unitNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit # (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Apt 101" {...field} />
                </FormControl>
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
                <Select onValueChange={field.onChange} value={field.value} disabled={isFetchingDropdownData || (!selectedInvestorId && !initialData?.investorId)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a card" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cards.map(card => ( // This 'cards' state is filtered based on selectedInvestorId
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

        {/* Receipt Image Upload */}
        <FormField
          control={form.control}
          name="receiptImageURI"
          render={({ field }) => ( 
            <FormItem>
              <FormLabel>Receipt Image (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </FormControl>
              {fileName && <p className="text-sm text-muted-foreground mt-1">Selected file: {fileName}</p>}
              {imagePreview && (
                <div className="mt-2 border rounded-md p-2 max-w-xs">
                  <Image 
                    src={imagePreview} 
                    alt="Receipt preview" 
                    width={200} 
                    height={200} 
                    className="object-contain rounded-md" 
                    data-ai-hint="receipt image"
                  />
                </div>
              )}
              <FormDescription>Upload an image of the receipt (PNG, JPG, WEBP).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isLoading || isFetchingDropdownData}>
          {isLoading ? "Saving..." : (initialData?.id ? "Update Transaction" : "Save Transaction")}
        </Button>
      </form>
    </Form>
  );
}
