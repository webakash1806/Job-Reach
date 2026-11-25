"use client";

import Link from "next/link";
import { ChevronsUpDownIcon, LogOutIcon, MonitorSmartphoneIcon, Settings2Icon, ShieldCheckIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import type { SidebarUser } from "@/components/app-sidebar";

function initials(user: SidebarUser) {
  const src = user.name || user.email;
  return src.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("");
}

export function NavUser({ user }: { user: SidebarUser }) {
  const { isMobile } = useSidebar();

  async function logout(all = false) {
    await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all }) });
    window.location.href = "/login";
  }

  const who = (
    <>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarFallback className="rounded-lg">{initials(user)}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name || user.email.split("@")[0]}</span>
        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
      </div>
    </>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              {who}
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">{who}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.role === "admin" && (
              <DropdownMenuItem asChild>
                <Link href="/admin/users">
                  <ShieldCheckIcon />
                  Manage users
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings2Icon />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings?tab=security">
                <MonitorSmartphoneIcon />
                Security and sessions
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout(true)}>
              <LogOutIcon />
              Log out everywhere
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
