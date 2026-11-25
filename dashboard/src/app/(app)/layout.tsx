import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <SidebarProvider>
      <AppSidebar user={{ name: user.name || "", email: user.email, role: user.role as "admin" | "user" }} />
      <SidebarInset>
        <SiteHeader />
        <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
