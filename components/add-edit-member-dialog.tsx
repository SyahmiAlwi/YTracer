"use client"

import { useState, useEffect } from "react"
import type { Member } from "@/lib/types"
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

interface AddEditMemberDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (member: Omit<Member, "id"> | Member) => void
  memberToEdit?: Member
}

export function AddEditMemberDialog({ isOpen, onClose, onSave, memberToEdit }: AddEditMemberDialogProps) {
  const [name, setName] = useState("")
  const [paymentType, setPaymentType] = useState<"Monthly" | "Yearly">("Monthly")
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Unpaid">("Unpaid")
  const [lastPaymentDate, setLastPaymentDate] = useState<Date | undefined>(undefined)
  const [nextDueDate, setNextDueDate] = useState<Date | undefined>(undefined)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name)
      setPaymentType(memberToEdit.paymentType)
      setPaymentStatus(memberToEdit.paymentStatus)
      setLastPaymentDate(memberToEdit.lastPaymentDate ? new Date(memberToEdit.lastPaymentDate) : undefined)
      setNextDueDate(memberToEdit.nextDueDate ? new Date(memberToEdit.nextDueDate) : undefined)
      setNotes(memberToEdit.notes)
    } else {
      // Reset form for new member
      setName("")
      setPaymentType("Monthly")
      setPaymentStatus("Unpaid")
      setLastPaymentDate(undefined)
      setNextDueDate(undefined)
      setNotes("")
    }
  }, [memberToEdit, isOpen])

  const handleSubmit = () => {
    if (!name || !lastPaymentDate || !nextDueDate) {
      alert("Please fill in all required fields: Name, Last Payment Date, Next Due Date.")
      return
    }

    const newMember: Omit<Member, "id"> | Member = memberToEdit
      ? {
          ...memberToEdit,
          name,
          paymentType,
          paymentStatus,
          lastPaymentDate: lastPaymentDate.toISOString().split("T")[0],
          nextDueDate: nextDueDate.toISOString().split("T")[0],
          notes,
        }
      : {
          name,
          paymentType,
          paymentStatus,
          lastPaymentDate: lastPaymentDate.toISOString().split("T")[0],
          nextDueDate: nextDueDate.toISOString().split("T")[0],
          notes,
        }
    onSave(newMember)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{memberToEdit ? "Edit Member" : "Add New Member"}</DialogTitle>
          <DialogDescription>
            {memberToEdit ? "Make changes to this member's details." : "Add a new family member to track."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentType" className="text-right">
              Payment Type
            </Label>
            <Select value={paymentType} onValueChange={(value: "Monthly" | "Yearly") => setPaymentType(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentStatus" className="text-right">
              Payment Status
            </Label>
            <Select value={paymentStatus} onValueChange={(value: "Paid" | "Unpaid") => setPaymentStatus(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastPaymentDate" className="text-right">
              Last Paid
            </Label>
            <DatePicker date={lastPaymentDate} setDate={setLastPaymentDate} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nextDueDate" className="text-right">
              Next Due
            </Label>
            <DatePicker date={nextDueDate} setDate={setNextDueDate} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="col-span-3" />
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
