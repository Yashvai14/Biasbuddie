import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import AuthProvider from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bias Checker AI",
  description: "Detect and analyze biases in textual content",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 flex flex-col">
                <Suspense>{children}</Suspense>
              </main>
              <footer className="w-full border-t py-6 md:py-0 bg-background/50 backdrop-blur-sm">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                  <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Bias Checker AI. All rights reserved.
                  </p>
                  <div className="flex gap-4">
                    <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Terms
                    </a>
                    <a
                      href="/privacy"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Privacy
                    </a>
                  </div>
                </div>
              </footer>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
