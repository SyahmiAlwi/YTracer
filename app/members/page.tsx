"use client"

import { useState } from "react"
import { useDataStore } from "@/hooks/use-data-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddEditMemberDialog } from "@/components/add-edit-member-dialog"
import { MembersTable } from "@/components/members-table"
import { Skeleton } from "@/components/ui/skeleton"
import type { Member } from "@/lib/types"

export default function MembersPage() {
  const { members, addMember, updateMember, deleteMember, isHydrated } = useDataStore()
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)

  const handleSaveMember = (member: Omit<Member, "id"> | Member) => {
    if ("id" in member) {
      updateMember(member)
    } else {
      addMember(member)
    }
  }

  // Show loading skeleton until hydration is complete
  if (!isHydrated) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="ml-auto h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
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
        <h1 className="text-lg font-semibold md:text-2xl">Family Members</h1>
        <Button className="ml-auto" onClick={() => setIsAddMemberDialogOpen(true)}>
          Add Member
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Member List</CardTitle>
          <CardDescription>Manage your YouTube Premium family members.</CardDescription>
        </CardHeader>
        <CardContent>
          <MembersTable members={members} onUpdateMember={updateMember} onDeleteMember={deleteMember} />
        </CardContent>
      </Card>

      <AddEditMemberDialog
        isOpen={isAddMemberDialogOpen}
        onClose={() => setIsAddMemberDialogOpen(false)}
        onSave={handleSaveMember}
        memberToEdit={undefined} // No member to edit when adding
      />
    </div>
  )
}
