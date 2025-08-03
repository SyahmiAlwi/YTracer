"use client"

import { useState, useEffect } from "react"
import type { Member, Transaction } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DatePicker } from "./date-picker"

interface AddEditTransactionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transaction: Omit<Transaction, "id"> | Transaction) => void
  transactionToEdit?: Transaction
  members: Member[] // Pass members to link transactions
}

export function AddEditTransactionDialog({
  isOpen,
  onClose,
  onSave,
  transactionToEdit,
  members,
}: AddEditTransactionDialogProps) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [amount, setAmount] = useState<string>("")
  const [memberId, setMemberId] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"Incoming" | "Outgoing">("Incoming")

  useEffect(() => {
    if (transactionToEdit) {
      setDate(transactionToEdit.date ? new Date(transactionToEdit.date) : undefined)
      setAmount(transactionToEdit.amount.toString())
      setMemberId(transactionToEdit.memberId)
      setDescription(transactionToEdit.description)
      setType(transactionToEdit.type)
    } else {
      // Reset form for new transaction
      setDate(undefined)
      setAmount("")
      setMemberId(null)
      setDescription("")
      setType("Incoming")
    }
  }, [transactionToEdit, isOpen])

  const handleSubmit = () => {
    if (!date || !amount || !description) {
      alert("Please fill in all required fields: Date, Amount, Description.")
      return
    }

    const parsedAmount = Number.parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid positive amount.")
      return
    }

    const newTransaction: Omit<Transaction, "id"> | Transaction = transactionToEdit
      ? {
          ...transactionToEdit,
          date: date.toISOString().split("T")[0],
          amount: parsedAmount,
          memberId,
          description,
          type,
        }
      : {
          date: date.toISOString().split("T")[0],
          amount: parsedAmount,
          memberId,
          description,
          type,
        }
    onSave(newTransaction)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transactionToEdit ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
          <DialogDescription>
            {transactionToEdit ? "Make changes to this transaction." : "Add a new payment transaction."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <DatePicker date={date} setDate={setDate} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member" className="text-right">
              Member
            </Label>
            <Select value={memberId || "none"} onValueChange={(value) => setMemberId(value === "none" ? null : value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select member (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (General Cost)</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={type} onValueChange={(value: "Incoming" | "Outgoing") => setType(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Incoming">Incoming</SelectItem>
                <SelectItem value="Outgoing">Outgoing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
