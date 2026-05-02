import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import SidebarApp from "@/components/SidebarApp";
import DashboardHeader from "@/components/DashboardHeader";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <SidebarApp />
        <SidebarInset className="bg-[#f5f5f7]">
          <DashboardHeader />
          <main className="flex flex-1 flex-col overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
