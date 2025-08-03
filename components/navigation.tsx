"use client"

import { Home, Users, DollarSign, CreditCard } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigationItems = [
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
    title: "Cards",
    url: "/card",
    icon: CreditCard,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <>
             {/* Desktop Navigation - Top Bar */}
       <nav className="hidden md:flex items-center justify-center gap-2 px-6 py-4">
         {navigationItems.map((item) => {
           const Icon = item.icon
           const isActive = pathname === item.url
           
           return (
             <Link
               key={item.title}
               href={item.url}
               className={cn(
                 "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 font-medium",
                 isActive
                   ? "bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-100"
                   : "text-gray-600 dark:text-gray-400 hover:text-red-900 dark:hover:text-red-100"
               )}
             >
               <Icon className="h-4 w-4" />
               <span>{item.title}</span>
             </Link>
           )
         })}
       </nav>

             {/* Mobile Navigation - Bottom Bar */}
       <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
         <div className="mx-4 mb-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
           <div className="flex items-center justify-around p-2">
             {navigationItems.map((item) => {
               const Icon = item.icon
               const isActive = pathname === item.url
               
               return (
                 <Link
                   key={item.title}
                   href={item.url}
                   className={cn(
                     "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors duration-200 min-w-[60px]",
                     isActive
                       ? "text-red-600 dark:text-red-400"
                       : "text-gray-600 dark:text-gray-400"
                   )}
                 >
                   <Icon className="h-5 w-5" />
                   <span className="text-xs font-medium">{item.title}</span>
                 </Link>
               )
             })}
           </div>
         </div>
       </nav>
    </>
  )
} 