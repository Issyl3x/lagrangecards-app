
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { investorSchema, type InvestorFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { addInvestor, getMockInvestors } from "@/lib/mock-data";
import type { Investor } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, UserCircle2 } from "lucide-react";

// Define admin email and current user's email for permission check
const ADMIN_EMAIL = 'jessrafalfernandez@gmail.com';
// To test teammate view, change this to a non-admin email like 'teammate@example.com'
const currentUsersEmail = 'jessrafalfernandez@gmail.com'; 
const IS_ADMIN = currentUsersEmail === ADMIN_EMAIL;


function AddInvestorForm({ onInvestorAdded }: { onInvestorAdded: () => void }) {
  const { toast } = useToast();
  const form = useForm<InvestorFormValues>({
    resolver: zodResolver(investorSchema),
    defaultValues: { name: "", email: "" },
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = (data: InvestorFormValues) => {
    setIsLoading(true);
    try {
      addInvestor(data);
      toast({ title: "Investor Added", description: `${data.name} has been added.` });
      form.reset();
      onInvestorAdded();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add investor.", variant: "destructive" });
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
              <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
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
              <FormControl><Input type="email" placeholder="e.g., john.doe@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Add Investor"}</Button>
      </form>
    </Form>
  );
}

export default function InvestorsPage() {
  const [investors, setInvestors] = React.useState<Investor[]>([]);

  const refreshInvestors = React.useCallback(() => {
    setInvestors(getMockInvestors());
  }, []);

  React.useEffect(() => {
    refreshInvestors();
  }, [refreshInvestors]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Investor</CardTitle>
          <CardDescription>Enter the details for a new investor.</CardDescription>
        </CardHeader>
        <CardContent>
          {IS_ADMIN ? (
            <AddInvestorForm onInvestorAdded={refreshInvestors} />
          ) : (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Admin Access Required</AlertTitle>
              <AlertDescription>
                Adding new investors is an administrator-only feature.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Current Investors</CardTitle>
          <CardDescription>List of all registered investors.</CardDescription>
        </CardHeader>
        <CardContent>
          {investors.length > 0 ? (
            <ul className="space-y-4">
              {investors.map(investor => (
                <li key={investor.id} className="flex items-center p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                  <UserCircle2 className="h-6 w-6 mr-3 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="font-medium text-card-foreground truncate block">{investor.name}</span>
                    {investor.email && <span className="block text-xs text-muted-foreground truncate">{investor.email}</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No investors found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
