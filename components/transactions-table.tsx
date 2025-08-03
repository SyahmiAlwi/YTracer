"use client"

import { useState } from "react"
import type { Member, Transaction } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { AddEditTransactionDialog } from "./add-edit-transaction-dialog"

interface TransactionsTableProps {
  transactions: Transaction[]
  members: Member[]
  onUpdateTransaction: (transaction: Transaction) => void
  onDeleteTransaction: (id: string) => void
}

export function TransactionsTable({
  transactions,
  members,
  onUpdateTransaction,
  onDeleteTransaction,
}: TransactionsTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined)

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return "N/A (General)"
    const member = members.find((m) => m.id === memberId)
    return member ? member.name : "Unknown Member"
  }

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDialogOpen(true)
  }

  const handleSave = (transaction: Omit<Transaction, "id"> | Transaction) => {
    onUpdateTransaction(transaction as Transaction) // Cast because it will always have an ID when editing
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="hover:bg-accent/50 transition-colors duration-200">
              <TableCell>{format(new Date(transaction.date), "PPP")}</TableCell>
              <TableCell className={transaction.type === "Incoming" ? "text-green-500" : "text-red-500"}>
                {transaction.type === "Incoming" ? "+" : "-"} RM{transaction.amount.toFixed(2)}
              </TableCell>
              <TableCell>{getMemberName(transaction.memberId)}</TableCell>
              <TableCell className="max-w-[200px] truncate">{transaction.description}</TableCell>
              <TableCell>
                <Badge variant={transaction.type === "Incoming" ? "secondary" : "outline"}>{transaction.type}</Badge>
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
                    <DropdownMenuItem onClick={() => onDeleteTransaction(transaction.id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AddEditTransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        transactionToEdit={selectedTransaction}
        members={members}
      />
    </>
  )
}
