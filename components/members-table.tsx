"use client"

import { useState } from "react"
import type { Member } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddEditMemberDialog } from "./add-edit-member-dialog"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { format } from "date-fns"

interface MembersTableProps {
  members: Member[]
  onUpdateMember: (member: Member) => void
  onDeleteMember: (id: string) => void
}

export function MembersTable({ members, onUpdateMember, onDeleteMember }: MembersTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | undefined>(undefined)

  const handleEdit = (member: Member) => {
    setSelectedMember(member)
    setIsDialogOpen(true)
  }

  const handleSave = (member: Omit<Member, "id"> | Member) => {
    onUpdateMember(member as Member) // Cast because it will always have an ID when editing
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Payment Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Paid</TableHead>
            <TableHead>Next Due</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id} className="hover:bg-accent/50 transition-colors duration-200">
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell>{member.paymentType}</TableCell>
              <TableCell>
                <Badge variant={member.paymentStatus === "Paid" ? "default" : "destructive"}>
                  {member.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(member.lastPaymentDate), "PPP")}</TableCell>
              <TableCell>{format(new Date(member.nextDueDate), "PPP")}</TableCell>
              <TableCell className="max-w-[200px] truncate">{member.notes || "-"}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:scale-105 active:scale-95">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(member)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteMember(member.id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AddEditMemberDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        memberToEdit={selectedMember}
      />
    </>
  )
}
