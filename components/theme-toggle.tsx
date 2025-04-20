"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled className="w-9 px-0" />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 px-0 relative"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: theme === "light" ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </motion.div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: theme === "dark" ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
