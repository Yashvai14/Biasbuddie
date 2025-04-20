"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTheme } from "next-themes"
import { Paintbrush, Sun, Moon, Monitor } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { premiumTheme } from "@/lib/premium-theme"
import { motion } from "framer-motion"

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const isPremium = !!user // In a real app, you'd check if the user has a premium subscription

  const applyPremiumTheme = () => {
    // Apply premium theme colors
    const root = document.documentElement
    const isDark = theme === "dark"
    const colors = isDark ? premiumTheme.dark : premiumTheme.light

    root.style.setProperty("--primary", colors.primary)
    root.style.setProperty("--secondary", colors.secondary)
    root.style.setProperty("--accent", colors.accent)
    root.style.setProperty("--chart-1", colors.chart1)
    root.style.setProperty("--chart-2", colors.chart2)
    root.style.setProperty("--chart-3", colors.chart3)
    root.style.setProperty("--chart-4", colors.chart4)
    root.style.setProperty("--chart-5", colors.chart5)
  }

  const resetTheme = () => {
    // Reset to default theme colors
    const root = document.documentElement
    root.style.removeProperty("--primary")
    root.style.removeProperty("--secondary")
    root.style.removeProperty("--accent")
    root.style.removeProperty("--chart-1")
    root.style.removeProperty("--chart-2")
    root.style.removeProperty("--chart-3")
    root.style.removeProperty("--chart-4")
    root.style.removeProperty("--chart-5")
  }

  const handleThemeChange = (value: string) => {
    setTheme(value)

    // If premium theme is selected and user is premium, apply it
    if (value === "premium" && isPremium) {
      applyPremiumTheme()
    } else {
      resetTheme()
    }

    setOpen(false)
  }

  // Theme preview cards with animations
  const ThemeCard = ({
    themeName,
    icon,
    active,
    onClick,
  }: { themeName: string; icon: React.ReactNode; active: boolean; onClick: () => void }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`cursor-pointer rounded-lg p-4 border-2 ${
        active ? "border-primary" : "border-transparent"
      } transition-all duration-300`}
      onClick={onClick}
    >
      <div className={`flex flex-col items-center gap-2 ${active ? "text-primary" : ""}`}>
        <div className="p-3 rounded-full bg-muted flex items-center justify-center">{icon}</div>
        <span className="font-medium">{themeName}</span>
      </div>
    </motion.div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative overflow-hidden group">
          <Paintbrush className="h-[1.2rem] w-[1.2rem] transition-transform group-hover:rotate-12" />
          <span className="absolute inset-0 rounded-md bg-primary/10 transform scale-0 group-hover:scale-100 transition-transform duration-300" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose a theme</DialogTitle>
          <DialogDescription>Select the theme that best suits your preference.</DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <ThemeCard
              themeName="Light"
              icon={<Sun className="h-6 w-6" />}
              active={theme === "light"}
              onClick={() => handleThemeChange("light")}
            />
            <ThemeCard
              themeName="Dark"
              icon={<Moon className="h-6 w-6" />}
              active={theme === "dark"}
              onClick={() => handleThemeChange("dark")}
            />
            <ThemeCard
              themeName="System"
              icon={<Monitor className="h-6 w-6" />}
              active={theme === "system"}
              onClick={() => handleThemeChange("system")}
            />
          </div>

          <RadioGroup defaultValue={theme} onValueChange={handleThemeChange} className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="premium" id="premium" disabled={!isPremium} />
              <Label htmlFor="premium" className={!isPremium ? "text-muted-foreground" : ""}>
                Premium Theme {!isPremium && "(Login required)"}
              </Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
