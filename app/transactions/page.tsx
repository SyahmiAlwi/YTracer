"use client"

import { useState } from "react"
import { useDataStore } from "@/hooks/use-data-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddEditTransactionDialog } from "@/components/add-edit-transaction-dialog"
import { TransactionsTable } from "@/components/transactions-table"
import { Skeleton } from "@/components/ui/skeleton"
import type { Transaction } from "@/lib/types"

export default function TransactionsPage() {
  const { transactions, members, addTransaction, updateTransaction, deleteTransaction, isHydrated } = useDataStore()
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false)

  const handleSaveTransaction = (transaction: Omit<Transaction, "id"> | Transaction) => {
    if ("id" in transaction) {
      updateTransaction(transaction)
    } else {
      addTransaction(transaction)
    }
  }

  // Show loading skeleton until hydration is complete
  if (!isHydrated) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="ml-auto h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Transactions</h1>
        <Button className="ml-auto" onClick={() => setIsAddTransactionDialogOpen(true)}>
          Add Transaction
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View and manage all incoming and outgoing payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsTable
            transactions={transactions}
            members={members}
            onUpdateTransaction={updateTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        </CardContent>
      </Card>

      <AddEditTransactionDialog
        isOpen={isAddTransactionDialogOpen}
        onClose={() => setIsAddTransactionDialogOpen(false)}
        onSave={handleSaveTransaction}
        transactionToEdit={undefined} // No transaction to edit when adding
        members={members}
      />
    </div>
  )
}
