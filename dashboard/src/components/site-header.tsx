"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  contacts: "Contacts",
  campaigns: "Campaigns",
  new: "New campaign",
  sent: "Sent",
  followups: "Follow-ups",
  resumes: "Resumes",
  templates: "Templates",
  extension: "Extension",
  settings: "Settings",
  admin: "Admin",
  users: "Users",
};

export function SiteHeader() {
  const parts = usePathname().split("/").filter(Boolean);
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/90 backdrop-blur">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
        <Breadcrumb>
          <BreadcrumbList>
            {parts.map((p, i) => {
              const href = "/" + parts.slice(0, i + 1).join("/");
              const label = LABELS[p] ?? "Details";
              const last = i === parts.length - 1;
              return (
                <span key={href} className="contents">
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {last ? (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={p === "admin" ? "/admin/users" : href}>{label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
