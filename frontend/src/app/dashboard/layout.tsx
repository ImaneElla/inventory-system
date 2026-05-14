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
        <SidebarInset className="bg-background w-full overflow-hidden">
          <DashboardHeader />
          <main className="flex flex-1 flex-col overflow-y-hidden overflow-x-hidden min-w-0">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
