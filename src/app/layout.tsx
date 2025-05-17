
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, List, ScanLine, FileOutput, Settings, Building2, Trash2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { EstateFlowLogo } from '@/components/icons/EstateFlowLogo';
import { cn } from '@/lib/utils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'EstateFlow - Bookkeeping',
  description: 'Track credit card transactions for real estate projects.',
};

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions/add', label: 'Add Transaction', icon: PlusCircle },
  { href: '/transactions', label: 'View Transactions', icon: List },
  { href: '/transactions/ocr', label: 'Upload Receipt', icon: ScanLine },
  { href: '/export', label: 'Export Data', icon: FileOutput },
  { href: '/transactions/deleted', label: 'Deleted Items', icon: Trash2 },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable, "antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full bg-muted/40">
              <Sidebar collapsible="icon" className="hidden border-r bg-sidebar text-sidebar-foreground md:block">
                <SidebarHeader className="border-b border-sidebar-border">
                  <Link href="/dashboard" className="flex h-14 items-center gap-2 px-4">
                    <EstateFlowLogo className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
                      EstateFlow
                    </span>
                  </Link>
                </SidebarHeader>
                <SidebarContent className="flex-1">
                  <SidebarMenu className="p-2">
                    {navItems.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          variant="ghost"
                          className="w-full justify-start"
                          tooltip={{ children: item.label, className: "ml-2" }}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarContent>
                <SidebarFooter className="mt-auto border-t border-sidebar-border p-2">
                   <SidebarMenu>
                     <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild
                          variant="ghost" 
                          className="w-full justify-start"
                          tooltip={{ children: "Settings", className: "ml-2"}}
                        >
                          <Link href="/settings">
                            <Settings className="h-5 w-5" />
                            <span>Settings</span>
                          </Link>
                        </SidebarMenuButton>
                     </SidebarMenuItem>
                   </SidebarMenu>
                </SidebarFooter>
              </Sidebar>
              <div className="flex flex-1 flex-col sm:gap-4 sm:py-4">
                <AppHeader />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
