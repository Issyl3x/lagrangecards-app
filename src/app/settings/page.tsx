"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  React.useEffect(() => {
    console.log("SettingsPage: Component successfully MOUNTED.");
    return () => {
      console.log("SettingsPage: Component UNMOUNTED.");
    };
  }, []);

  console.log("SettingsPage: RENDERING component.");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Manage application settings here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the simplified Settings page content.</p>
          <p>If you see this, the page component itself is rendering and has mounted.</p>
        </CardContent>
      </Card>
    </div>
  );
}
