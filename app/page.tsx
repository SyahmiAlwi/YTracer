"use client"

import { useMemo } from "react"
import { useDataStore } from "@/hooks/use-data-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Wallet, Users, TrendingUp, TrendingDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default function DashboardPage() {
  const { members, transactions, isHydrated } = useDataStore()

  const { totalIncome, totalOutgoing, netBalance, paidMembers, unpaidMembers, upcomingPayments } = useMemo(() => {
    const income = transactions.filter((t) => t.type === "Incoming").reduce((sum, t) => sum + t.amount, 0)

    const outgoing = transactions.filter((t) => t.type === "Outgoing").reduce((sum, t) => sum + t.amount, 0)

    const net = income - outgoing

    const paid = members.filter((m) => m.paymentStatus === "Paid").length
    const unpaid = members.filter((m) => m.paymentStatus === "Unpaid").length

    const today = new Date()
    const next30Days = new Date()
    next30Days.setDate(today.getDate() + 30)

    const upcoming = members
      .filter((m) => {
        const dueDate = new Date(m.nextDueDate)
        return m.paymentStatus === "Unpaid" && dueDate >= today && dueDate <= next30Days
      })
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())

    return {
      totalIncome: income,
      totalOutgoing: outgoing,
      netBalance: net,
      paidMembers: paid,
      unpaidMembers: unpaid,
      upcomingPayments: upcoming,
    }
  }, [members, transactions])

  // Show loading skeleton until hydration is complete
  if (!isHydrated) {
    return (
      <div className="flex flex-1 flex-col gap-5 p-4 md:gap-6 md:p-6">
        <div className="text-left">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="grid gap-4 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="grid gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:gap-6 md:p-6">
      <div className="text-left">
        <h1 className="text-2xl font-bold md:text-3xl text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base">Track your YouTube Premium family payments</p>
      </div>
      <div className="grid gap-4 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {"RM"}
              {totalIncome.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">From family members</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Outgoing</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {"RM"}
              {totalOutgoing.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">To YouTube & other costs</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {"RM"}
              {netBalance.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your current financial standing</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Members Status</CardTitle>
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {paidMembers} / {members.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {paidMembers} Paid, {unpaidMembers} Unpaid
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white">Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Member</TableHead>
                      <TableHead className="min-w-[140px]">Next Due</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingPayments.map((member) => (
                      <TableRow key={member.id} className="hover:bg-accent/50 transition-colors duration-200">
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell className="text-sm">{format(new Date(member.nextDueDate), "MMM dd")}</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="text-xs">Unpaid</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming payments due in the next 30 days.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild variant="outline" className="h-12">
              <Link href="/members">Manage Members</Link>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <Link href="/transactions">View All Transactions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
