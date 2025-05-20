
"use client";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from 'react';
import { usePathname } from 'next/navigation';

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/transactions/add")) return "Add Transaction";
  if (pathname.startsWith("/transactions/ocr")) return "Upload / Import Transactions";
  if (pathname.startsWith("/transactions/reconcile")) return "Reconcile Transactions";
  if (pathname.startsWith("/transactions/edit")) return "Edit Transaction";
  if (pathname.startsWith("/transactions/deleted")) return "Deleted Items";
  if (pathname.startsWith("/transactions")) return "View Transactions";
  if (pathname.startsWith("/export")) return "Export Data";
  if (pathname.startsWith("/investors")) return "Manage Investors";
  if (pathname.startsWith("/properties")) return "Manage Properties";
  if (pathname.startsWith("/cards/edit")) return "Edit Card";
  if (pathname.startsWith("/cards")) return "Manage Cards";
  return "Lagrange Card"; // Default title
};

export function AppHeader() {
  const { isMobile } = useSidebar();
  const { setTheme, theme } = useTheme() || { setTheme: () => {}, theme: 'light' };
  const pathname = usePathname();
  const [currentPageTitle, setCurrentPageTitle] = React.useState<string | null>(null);
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
    setCurrentPageTitle(getPageTitle(pathname));
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {hasMounted && isMobile ? <SidebarTrigger /> : <div className="w-7 h-7 md:hidden" /> /* Placeholder for mobile to prevent layout shift */}
      <div className="flex-1">
        {/* Only render h1 if title is set and component has mounted, to avoid initial mismatch */}
        {hasMounted && currentPageTitle !== null && (
          <h1 className="text-xl font-semibold">{currentPageTitle}</h1>
        )}
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
      </div>
    </header>
  );
}
