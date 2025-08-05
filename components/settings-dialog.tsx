"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDataStore } from "@/hooks/use-data-store"
import { Settings } from "lucide-react"

export function SettingsDialog() {
  const { settings, updateYouTubePremiumCost } = useDataStore()
  const [isOpen, setIsOpen] = useState(false)
  const [youtubeCost, setYoutubeCost] = useState(settings.youtubePremiumCost.toString())
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const cost = parseFloat(youtubeCost)
      if (isNaN(cost) || cost < 0) {
        alert("Please enter a valid cost amount")
        return
      }
      
      updateYouTubePremiumCost(cost)
      setIsOpen(false)
    } catch (error) {
      console.error("Error updating YouTube Premium cost:", error)
      alert("Failed to update cost. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setYoutubeCost(settings.youtubePremiumCost.toString())
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
          <DialogDescription>
            Update your YouTube Premium subscription cost and other settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="youtube-cost" className="text-right">
              YouTube Premium Cost
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">RM</span>
              <Input
                id="youtube-cost"
                type="number"
                step="0.01"
                min="0"
                value={youtubeCost}
                onChange={(e) => setYoutubeCost(e.target.value)}
                className="col-span-3"
                placeholder="18.99"
              />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date(settings.lastUpdated).toLocaleDateString()}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 