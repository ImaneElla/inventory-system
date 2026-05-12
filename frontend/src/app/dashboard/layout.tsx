import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import SidebarApp from "@/components/dashboard/SidebarApp";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <SidebarApp />
        <SidebarInset className="bg-background">
          <DashboardHeader />
          <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-w-0">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
