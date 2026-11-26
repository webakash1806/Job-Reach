"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ContactIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  MailCheckIcon,
  MailPlusIcon,
  PuzzleIcon,
  ReplyIcon,
  SendIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react";
import { Mark } from "@/components/brand";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export type SidebarUser = { name: string; email: string; role: "admin" | "user" };

const groups = [
  {
    label: "Outreach",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
      { title: "Contacts", url: "/contacts", icon: ContactIcon },
      { title: "Campaigns", url: "/campaigns", icon: SendIcon },
      { title: "Sent", url: "/sent", icon: MailCheckIcon },
      { title: "Follow-ups", url: "/followups", icon: ReplyIcon },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Resumes", url: "/resumes", icon: FileTextIcon },
      { title: "Templates", url: "/templates", icon: MailPlusIcon },
      { title: "Extension", url: "/extension", icon: PuzzleIcon },
      { title: "Settings", url: "/settings", icon: Settings2Icon },
    ],
  },
];

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: SidebarUser }) {
  const pathname = usePathname();
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  const all = user.role === "admin"
    ? [...groups, { label: "Admin", items: [{ title: "Users", url: "/admin/users", icon: UsersIcon }] }]
    : groups;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background">
                  <Mark className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Job Outreach</span>
                  <span className="truncate text-xs text-muted-foreground">Recruiter outreach</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {all.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarMenu>
              {g.items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
