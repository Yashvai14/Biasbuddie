"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Shield, Users, BarChart2, Sparkles } from "lucide-react"
import FeatureCard from "@/components/feature-card"
import { useAuth } from "@/components/auth-provider"
import { motion } from "framer-motion"

export default function Home() {
  const { isSupabaseAvailable } = useAuth()
  const router = useRouter()
  const [animationsLoaded, setAnimationsLoaded] = useState(false)

  useEffect(() => {
    // Redirect to setup page if Supabase is not available
    if (isSupabaseAvailable === false) {
      router.push("/setup")
    }
  }, [isSupabaseAvailable, router])

  // Set animations as loaded after component mounts
  useEffect(() => {
    setAnimationsLoaded(true)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background relative overflow-hidden">
          {/* Background gradient elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl animate-float" />
            <div
              className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-float"
              style={{ animationDelay: "2s" }}
            />
          </div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 mb-4"
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    Premium AI-Powered Analysis
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text"
                  >
                    Detect & Analyze Bias in Text
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="max-w-[600px] text-muted-foreground md:text-xl"
                  >
                    Our AI-powered platform helps you ensure your writing is neutral, unbiased, and inclusive.
                  </motion.p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex flex-col gap-2 min-[400px]:flex-row"
                >
                  <Link href="/analyzer">
                    <Button
                      size="lg"
                      className="gap-1.5 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 transition-all duration-300 shadow-lg hover:shadow-primary/20 group"
                    >
                      Try Analyzer
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary/20 hover:border-primary/40 transition-all duration-300"
                    >
                      Learn More
                    </Button>
                  </Link>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="flex justify-center"
              >
                <div className="relative w-full max-w-[500px] aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/30 p-1 shadow-xl animate-gradient">
                  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-xl">
                    <div className="text-center space-y-2">
                      <Shield className="h-16 w-16 mx-auto text-primary animate-pulse-slow" />
                      <p className="font-medium">Bias-free content starts here</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">
                  Key Features
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform offers comprehensive tools to detect bias, share news, and engage in discussions.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              animate={animationsLoaded ? "show" : "hidden"}
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8"
            >
              <motion.div variants={item} className="premium-card">
                <FeatureCard
                  icon={<BarChart2 className="h-10 w-10 text-primary" />}
                  title="Bias Detection & Analysis"
                  description="Real-time AI-based analysis to classify gender, political, and racial bias with suggestions for making content more neutral."
                />
              </motion.div>
              <motion.div variants={item} className="premium-card">
                <FeatureCard
                  icon={<Users className="h-10 w-10 text-primary" />}
                  title="Community Forum"
                  description="Create posts, engage in discussions, and participate in a moderated safe environment with toxic content filtering."
                />
              </motion.div>
              <motion.div variants={item} className="premium-card">
                <FeatureCard
                  icon={<Check className="h-10 w-10 text-primary" />}
                  title="News Sharing & Voting"
                  description="Share news articles and vote to promote unbiased content in the community."
                />
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  )
}
