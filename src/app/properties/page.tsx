
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema, type PropertyFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { addProperty, getMockProperties } from "@/lib/mock-data";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Home, Loader2 } from "lucide-react";

// --- PROTOTYPE ROLE-BASED ACCESS NOTE ---
// This page simulates role-based access. Adding new properties is restricted
// to the ADMIN_EMAIL. In a production app, use real authentication.
// --- END PROTOTYPE ROLE-BASED ACCESS NOTE ---
const ADMIN_EMAIL = 'jessrafalfernandez@gmail.com';
// To test non-admin view, change currentUsersEmail
const currentUsersEmail = 'jessrafalfernandez@gmail.com'; 
const IS_ADMIN = currentUsersEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

function AddPropertyForm({ onPropertyAdded }: { onPropertyAdded: () => void }) {
  const { toast } = useToast();
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: { name: "" },
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (data: PropertyFormValues) => {
    setIsSubmitting(true);
    try {
      await addProperty(data.name);
      toast({ title: "Property Added", description: `${data.name} has been added.` });
      form.reset();
      onPropertyAdded();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add property.", variant: "destructive" });
      console.error("Failed to add property:", error);
    } finally {
      setIsSubmitting(false);
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
              <FormLabel>Property Name</FormLabel>
              <FormControl><Input placeholder="e.g., Downtown Apartments" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Property"}</Button>
      </form>
    </Form>
  );
}

export default function PropertiesPage() {
  const [properties, setProperties] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshProperties = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMockProperties();
      setProperties(data);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      // Optionally show a toast for fetch errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshProperties();
  }, [refreshProperties]);

  if (isLoading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Property</CardTitle>
          <CardDescription>Enter the name for a new property.</CardDescription>
        </CardHeader>
        <CardContent>
          {IS_ADMIN ? (
            <AddPropertyForm onPropertyAdded={refreshProperties} />
          ) : (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Admin Access Required</AlertTitle>
              <AlertDescription>
                Adding new properties is an administrator-only feature.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Current Properties</CardTitle>
          <CardDescription>List of all registered properties.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && properties.length > 0 && <p>Refreshing properties...</p>}
          {!isLoading && properties.length === 0 ? (
            <p className="text-sm text-muted-foreground">No properties found.</p>
          ) : (
            <ul className="space-y-4">
              {properties.map(property => (
                <li key={property} className="flex items-center p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                  <Home className="h-6 w-6 mr-3 text-primary flex-shrink-0" />
                  <span className="font-medium text-card-foreground truncate">{property}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
