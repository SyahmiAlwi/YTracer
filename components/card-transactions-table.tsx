"use client"

import { useState } from "react"
import type { CardTransaction } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { AddEditCardTransactionDialog } from "./add-edit-card-transaction-dialog"

interface CardTransactionsTableProps {
  cardTransactions: CardTransaction[]
  onUpdateCardTransaction: (transaction: CardTransaction) => void
  onDeleteCardTransaction: (id: string) => void
}

export function CardTransactionsTable({
  cardTransactions,
  onUpdateCardTransaction,
  onDeleteCardTransaction,
}: CardTransactionsTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<CardTransaction | undefined>(undefined)

  const handleEdit = (transaction: CardTransaction) => {
    setSelectedTransaction(transaction)
    setIsDialogOpen(true)
  }

  const handleSave = (transaction: Omit<CardTransaction, "id"> | CardTransaction) => {
    onUpdateCardTransaction(transaction as CardTransaction) // Cast because it will always have an ID when editing
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(cardTransactions || []).map((transaction) => (
            <TableRow key={transaction.id} className="hover:bg-accent/50 transition-colors duration-200">
              <TableCell>{format(new Date(transaction.date), "PPP")}</TableCell>
              <TableCell className={transaction.type === "Deposit" ? "text-green-500" : "text-red-500"}>
                {transaction.type === "Deposit" ? "+" : "-"} RM{transaction.amount.toFixed(2)}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{transaction.description}</TableCell>
              <TableCell>
                <Badge variant={transaction.type === "Deposit" ? "secondary" : "outline"}>{transaction.type}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:scale-105 active:scale-95">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(transaction)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteCardTransaction(transaction.id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AddEditCardTransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        transactionToEdit={selectedTransaction}
      />
    </>
  )
}
