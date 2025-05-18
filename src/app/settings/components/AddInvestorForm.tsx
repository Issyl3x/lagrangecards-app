
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { investorSchema, type InvestorFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addInvestor } from "@/lib/mock-data";
// import { useRouter } from "next/navigation"; // Not used

interface AddInvestorFormProps {
  onInvestorAdded: () => void;
}

export function AddInvestorForm({ onInvestorAdded }: AddInvestorFormProps) {
  const { toast } = useToast();
  // const router = useRouter(); // Not used
  const form = useForm<InvestorFormValues>({
    resolver: zodResolver(investorSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = (data: InvestorFormValues) => {
    setIsLoading(true);
    try {
      const newInvestor = addInvestor(data);
      toast({
        title: "Investor Added",
        description: `${newInvestor.name} has been added to the list of investors.`,
      });
      form.reset();
      onInvestorAdded(); 
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add investor.",
        variant: "destructive",
      });
      console.error("Failed to add investor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investor Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g., john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Investor"}
        </Button>
      </form>
    </Form>
  );
}
