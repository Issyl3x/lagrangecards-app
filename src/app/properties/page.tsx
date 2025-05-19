
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
import { ShieldAlert, Home } from "lucide-react";

// Define mock current user for permission check
// To test teammate view, change role to 'teammate'
const mockCurrentUser = {
  id: 'user1', 
  role: 'admin',  // 'admin' or 'teammate'
};

function AddPropertyForm({ onPropertyAdded }: { onPropertyAdded: () => void }) {
  const { toast } = useToast();
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: { name: "" },
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = (data: PropertyFormValues) => {
    setIsLoading(true);
    try {
      addProperty(data.name);
      toast({ title: "Property Added", description: `${data.name} has been added.` });
      form.reset();
      onPropertyAdded();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add property.", variant: "destructive" });
      console.error("Failed to add property:", error);
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
              <FormLabel>Property Name</FormLabel>
              <FormControl><Input placeholder="e.g., Downtown Apartments" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Add Property"}</Button>
      </form>
    </Form>
  );
}

export default function PropertiesPage() {
  const [properties, setProperties] = React.useState<string[]>([]);

  const refreshProperties = React.useCallback(() => {
    setProperties(getMockProperties());
  }, []);

  React.useEffect(() => {
    refreshProperties();
  }, [refreshProperties]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Property</CardTitle>
          <CardDescription>Enter the name for a new property.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockCurrentUser.role === 'admin' ? (
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
          {properties.length > 0 ? (
            <ul className="space-y-4">
              {properties.map(property => (
                <li key={property} className="flex items-center p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                  <Home className="h-6 w-6 mr-3 text-primary flex-shrink-0" />
                  <span className="font-medium text-card-foreground truncate">{property}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No properties found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
