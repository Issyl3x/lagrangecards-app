
"use client";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes"; // Assuming next-themes is or will be installed for theme toggling

// Placeholder for page title - ideally, this would come from a context or routing
const getPageTitle = (pathname: string) => {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/transactions/add")) return "Add Transaction";
  if (pathname.startsWith("/transactions/ocr")) return "Upload Receipt (OCR)";
  if (pathname.startsWith("/transactions")) return "View Transactions";
  if (pathname.startsWith("/export")) return "Export Data";
  return "EstateFlow";
};

export function AppHeader() {
  const { isMobile } = useSidebar(); // Get isMobile from sidebar context
  const { setTheme, theme } = useTheme() || { setTheme: () => {}, theme: 'light' }; // Provide default if useTheme is not set up
  
  // This is a client component, so window.location.pathname is available after mount
  // For SSR compatibility and to avoid hydration errors, use a state that updates on mount
  const [currentPageTitle, setCurrentPageTitle] = React.useState("EstateFlow");
  React.useEffect(() => {
    setCurrentPageTitle(getPageTitle(window.location.pathname));
  }, []);


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {isMobile && <SidebarTrigger />}
      <div className="flex-1">
        <h1 className="text-xl font-semibold">{currentPageTitle}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
                <AvatarFallback>EF</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// A simple React import is needed for useEffect and useState
import * as React from 'react';
