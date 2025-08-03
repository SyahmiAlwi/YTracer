"use client"

import { Home, Youtube, Users, DollarSign, Calendar, CreditCard } from "lucide-react" // Added CreditCard
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
// Removed ThemeToggle import from here

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Members",
    url: "/members",
    icon: Users,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: DollarSign,
  },
  {
    title: "Card Management", // New menu item
    url: "/card",
    icon: CreditCard,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="flex items-center gap-2 px-4 py-4 md:py-3">
        <Youtube className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">YTracker</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} className="hover:text-sidebar-accent transition-colors duration-200 py-3 md:py-2">
                      <item.icon className="h-5 w-5 md:h-4 md:w-4" />
                      <span className="text-base md:text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>About</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#" className="hover:text-sidebar-accent transition-colors duration-200">
                    <Calendar />
                    <span>Version 1.0</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Removed ThemeToggle from here */}
    </Sidebar>
  )
}
