
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
          <AddPropertyForm onPropertyAdded={refreshProperties} />
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
            <ul className="space-y-2">
              {properties.map(property => (
                <li key={property} className="p-2 border rounded-md text-sm font-medium">
                  {property}
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
