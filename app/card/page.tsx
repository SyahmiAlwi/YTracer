"use client"

import { useState, useMemo } from "react"
import { useDataStore } from "@/hooks/use-data-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddEditCardTransactionDialog } from "@/components/add-edit-card-transaction-dialog"
import { CardTransactionsTable } from "@/components/card-transactions-table"
import { CardDetailsForm } from "@/components/card-details-form"
import { SettingsDialog } from "@/components/settings-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { CardTransaction } from "@/lib/types"
import { CreditCard, Wallet } from "lucide-react"

export default function CardPage() {
  const {
    cardDetail,
    cardTransactions,
    settings,
    updateCardDetail,
    addCardTransaction,
    updateCardTransaction,
    deleteCardTransaction,
    isHydrated,
  } = useDataStore()

  const [isAddCardTransactionDialogOpen, setIsAddCardTransactionDialogOpen] = useState(false)

  const handleSaveCardTransaction = (transaction: Omit<CardTransaction, "id"> | CardTransaction) => {
    if ("id" in transaction) {
      updateCardTransaction(transaction)
    } else {
      addCardTransaction(transaction)
    }
  }

  const { currentCardBalance, youtubePremiumCost, moneyNeeded } = useMemo(() => {
    // Ensure cardTransactions is an array before calling reduce
    const balance = (cardTransactions || []).reduce((sum, t) => {
      return t.type === "Deposit" ? sum + t.amount : sum - t.amount
    }, 0)

    // Use the settings for YouTube Premium cost instead of hardcoded transaction
    const cost = settings.youtubePremiumCost

    const needed = balance < cost ? cost - balance : 0

    return {
      currentCardBalance: balance,
      youtubePremiumCost: cost,
      moneyNeeded: needed,
    }
  }, [cardTransactions, settings.youtubePremiumCost])

  // Show loading skeleton until hydration is complete
  if (!isHydrated) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Skeleton className="h-8 w-48" />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-32" />
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
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Card Management</h1>
        <SettingsDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="group hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Card Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {"RM"}
              {currentCardBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total funds on your card</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YouTube Premium Cost</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {"RM"}
              {youtubePremiumCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Monthly subscription cost</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Money Needed</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${moneyNeeded > 0 ? "text-red-500" : "text-green-500"}`}>
              {"RM"}
              {moneyNeeded.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Amount to deposit to avoid decline</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {cardDetail && <CardDetailsForm cardDetail={cardDetail} onSave={updateCardDetail} />}
        {!cardDetail && (
          <Card className="group hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
            <CardHeader>
              <CardTitle>Card Details</CardTitle>
              <CardDescription>No card details found. Add them here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() =>
                  updateCardDetail({ id: "card-1", cardName: "", lastFourDigits: "", expiryDate: "", notes: "" })
                }
              >
                Add Card Details
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="group hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Card Balance Transactions</CardTitle>
            <Button onClick={() => setIsAddCardTransactionDialogOpen(true)} size="sm">
              Add Transaction
            </Button>
          </CardHeader>
          <CardContent>
            <CardTransactionsTable
              cardTransactions={cardTransactions}
              onUpdateCardTransaction={updateCardTransaction}
              onDeleteCardTransaction={deleteCardTransaction}
            />
          </CardContent>
        </Card>
      </div>

      <AddEditCardTransactionDialog
        isOpen={isAddCardTransactionDialogOpen}
        onClose={() => setIsAddCardTransactionDialogOpen(false)}
        onSave={handleSaveCardTransaction}
        transactionToEdit={undefined}
      />
    </div>
  )
}
