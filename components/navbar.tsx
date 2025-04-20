"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Menu, X, LogOut, User, AlertTriangle, Home, BarChart2, Newspaper, MessageSquare } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"
import ThemeSwitcher from "@/components/theme-switcher"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { signOut } from "@/lib/actions/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isLoading, isSupabaseAvailable } = useAuth()

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Analyzer", path: "/analyzer", icon: <BarChart2 className="h-4 w-4 mr-2" /> },
    { name: "News", path: "/news", icon: <Newspaper className="h-4 w-4 mr-2" /> },
    { name: "Forum", path: "/forum", icon: <MessageSquare className="h-4 w-4 mr-2" /> },
  ]

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const getUserInitials = () => {
    if (!user) return "U"
    const email = user.email || ""
    return email.charAt(0).toUpperCase()
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "bg-background/80 backdrop-blur-lg shadow-sm" : "bg-background/95"
        }`}
      >
        <div className="container flex h-16 items-center justify-between">
          <motion.div
            className="flex items-center gap-2 font-bold text-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Shield className="h-6 w-6 text-primary animate-pulse-slow" />
            <Link href="/">
              <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">
                Bias Checker AI
              </span>
            </Link>
          </motion.div>

          {/* Mobile menu button */}
          <motion.button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  href={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary relative group ${
                    isActive(item.path) ? "text-primary font-semibold" : "text-foreground/80"
                  }`}
                >
                  <span className="flex items-center">
                    {item.icon}
                    {item.name}
                  </span>
                  {isActive(item.path) && (
                    <motion.span
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full"
                      layoutId="navbar-indicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <ThemeSwitcher />

            {isLoading ? (
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            ) : isSupabaseAvailable && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full overflow-hidden relative group">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300">
                      <AvatarFallback className="bg-primary/10 text-primary">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="absolute inset-0 rounded-full bg-primary/10 transform scale-0 group-hover:scale-100 transition-transform duration-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer flex items-center text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="btn-premium">
                      Login
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Link href="/signup">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 transition-all duration-300"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden border-t"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container py-4 flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary py-2 flex items-center ${
                    isActive(item.path) ? "text-primary font-semibold" : "text-foreground/80"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center gap-4 pt-2 border-t">
                <ThemeToggle />
                <ThemeSwitcher />
                {isSupabaseAvailable && user ? (
                  <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                ) : (
                  <>
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup" className="flex-1">
                      <Button size="sm" className="w-full bg-gradient-to-r from-primary to-purple-500">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Supabase not available warning */}
      {!isSupabaseAvailable && (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Supabase configuration is missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
            environment variables.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
