
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema, type PropertyFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addProperty } from "@/lib/mock-data";
import { useRouter } from "next/navigation";

interface AddPropertyFormProps {
  onPropertyAdded: () => void;
}

export function AddPropertyForm({ onPropertyAdded }: AddPropertyFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
    },
  });

  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = (data: PropertyFormValues) => {
    setIsLoading(true);
    try {
      addProperty(data.name);
      toast({
        title: "Property Added",
        description: `${data.name} has been added to the list of properties.`,
      });
      form.reset();
      onPropertyAdded();
      // router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add property.",
        variant: "destructive",
      });
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
              <FormControl>
                <Input placeholder="e.g., Downtown Apartments" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Property"}
        </Button>
      </form>
    </Form>
  );
}
