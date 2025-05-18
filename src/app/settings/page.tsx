
"use client"; 

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { AddInvestorForm } from "./components/AddInvestorForm";
import { AddPropertyForm } from "./components/AddPropertyForm";
import { AddCardForm } from "./components/AddCardForm";
import { getMockInvestors, getMockProperties, getMockCards } from "@/lib/mock-data";
import type { Investor, Card as UserCard } from "@/lib/types"; 
import { Separator } from "@/components/ui/separator";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function SettingsPage() {
  const [investors, setInvestors] = React.useState<Investor[]>([]);
  const [properties, setProperties] = React.useState<string[]>([]);
  const [cards, setCards] = React.useState<UserCard[]>([]);

  const refreshData = React.useCallback(() => {
    const fetchedInvestors = getMockInvestors();
    const fetchedProperties = getMockProperties();
    const fetchedCards = getMockCards();

    console.log("SettingsPage: Fetched Investors", fetchedInvestors);
    console.log("SettingsPage: Fetched Properties", fetchedProperties);
    console.log("SettingsPage: Fetched Cards", fetchedCards);

    setInvestors(fetchedInvestors || []);
    setProperties(fetchedProperties || []);
    setCards(fetchedCards || []);
  }, []); 

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Manage investors, properties, and cards used in the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorBoundary fallbackMessage="Error loading the entire Settings Tabs section.">
            <Tabs defaultValue="investors" className="space-y-4">
              <TabsList>
                <TabsTrigger value="investors">Manage Investors</TabsTrigger>
                <TabsTrigger value="properties">Manage Properties</TabsTrigger>
                <TabsTrigger value="cards">Manage Cards</TabsTrigger>
              </TabsList>

              <TabsContent value="investors" className="space-y-4">
                <ErrorBoundary fallbackMessage="Error loading Investor Management section.">
                  <Card>
                    <CardHeader>
                      <CardTitle>Add New Investor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AddInvestorForm onInvestorAdded={refreshData} />
                    </CardContent>
                  </Card>
                  {/* <Separator />
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Investors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(investors) && investors.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {investors.map(inv => <li key={inv.id}>{inv.name} {inv.email && `(${inv.email})`}</li>)}
                        </ul>
                      ) : <p>No investors added yet.</p>}
                    </CardContent>
                  </Card> */}
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="properties" className="space-y-4">
                <ErrorBoundary fallbackMessage="Error loading Property Management section.">
                  <Card>
                    <CardHeader>
                      <CardTitle>Add New Property</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AddPropertyForm onPropertyAdded={refreshData} />
                    </CardContent>
                  </Card>
                  {/* <Separator />
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Properties</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(properties) && properties.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {properties.map(prop => <li key={prop}>{prop}</li>)}
                        </ul>
                      ) : <p>No properties added yet.</p>}
                    </CardContent>
                  </Card> */}
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="cards" className="space-y-4">
                <ErrorBoundary fallbackMessage="Error loading Card Management section.">
                  <Card>
                    <CardHeader>
                      <CardTitle>Add New Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AddCardForm onCardAdded={refreshData} />
                    </CardContent>
                  </Card>
                  {/* <Separator />
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Cards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(cards) && cards.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {cards.map(card => {
                            const investor = Array.isArray(investors) ? investors.find(inv => inv.id === card.investorId) : undefined;
                            return (
                              <li key={card.id}>
                                {card.cardName}
                                {card.last4Digits && ` (****${card.last4Digits})`}
                                {investor && ` - ${investor.name}`}
                                {card.property && ` - ${card.property}`}
                              </li>
                            );
                          })}
                        </ul>
                      ) : <p>No cards added yet.</p>}
                    </CardContent>
                  </Card> */}
                </ErrorBoundary>
              </TabsContent>
            </Tabs>
          </ErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
}
