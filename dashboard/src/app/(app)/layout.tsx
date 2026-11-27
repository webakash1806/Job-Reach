import "../globals.css";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar user={{ name: user.name || "", email: user.email, role: user.role as "admin" | "user" }} />
        <SidebarInset className="min-w-0">
          <SiteHeader />
          {/* @container: pages switch table/card and column layouts on this area's width, not the window's (the sidebar takes part of it) */}
          <div className="@container mx-auto flex w-full min-w-0 max-w-[1400px] flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster richColors position="bottom-right" />
    </TooltipProvider>
  );
}
