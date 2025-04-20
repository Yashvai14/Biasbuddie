"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { motion } from "framer-motion"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="flex flex-col items-center text-center h-full overflow-hidden border-primary/10 hover:border-primary/30 transition-colors duration-300 shadow-sm hover:shadow-md">
      <CardHeader className="pb-2 relative">
        <motion.div
          className="mb-2 p-3 rounded-full bg-primary/10 text-primary"
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-500 bg-[length:200%_100%] bg-clip-text text-transparent transition-all duration-500 hover:bg-[position:0%_0%]">
          {title}
        </h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}
