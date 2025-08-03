"use client"

import { useState, useEffect } from "react"
import type { CardDetail } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CardDetailsFormProps {
  cardDetail: CardDetail | null
  onSave: (detail: CardDetail) => void
}

export function CardDetailsForm({ cardDetail, onSave }: CardDetailsFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [cardName, setCardName] = useState("")
  const [lastFourDigits, setLastFourDigits] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (cardDetail) {
      setCardName(cardDetail.cardName)
      setLastFourDigits(cardDetail.lastFourDigits)
      setExpiryDate(cardDetail.expiryDate)
      setNotes(cardDetail.notes)
    }
  }, [cardDetail])

  const handleSave = () => {
    if (!cardName || !lastFourDigits || !expiryDate) {
      alert("Please fill in all required card details: Card Name, Last 4 Digits, Expiry Date.")
      return
    }
    const updatedDetail: CardDetail = {
      id: cardDetail?.id || "card-1", // Assuming a single card, or generate new ID if null
      cardName,
      lastFourDigits,
      expiryDate,
      notes,
    }
    onSave(updatedDetail)
    setIsEditing(false)
  }

  return (
    <Card className="group hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Card Details</CardTitle>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="grid gap-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cardName" className="text-right">
                Card Name
              </Label>
              <Input
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastFourDigits" className="text-right">
                Last 4 Digits
              </Label>
              <Input
                id="lastFourDigits"
                value={lastFourDigits}
                onChange={(e) => setLastFourDigits(e.target.value)}
                maxLength={4}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiryDate" className="text-right">
                Expiry (MM/YY)
              </Label>
              <Input
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="col-span-3" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Card Name:</span>
              <span className="font-medium">{cardName || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last 4 Digits:</span>
              <span className="font-medium">{lastFourDigits ? `**** ${lastFourDigits}` : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expiry Date:</span>
              <span className="font-medium">{expiryDate || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notes:</span>
              <span className="font-medium text-right max-w-[70%] truncate">{notes || "N/A"}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
