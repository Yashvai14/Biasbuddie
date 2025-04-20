"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/auth-helpers-nextjs"

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isSupabaseAvailable: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isSupabaseAvailable: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(true)

  // Check if Supabase environment variables are available
  const supabaseAvailable =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string"

  useEffect(() => {
    setIsSupabaseAvailable(supabaseAvailable)

    if (!supabaseAvailable) {
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error("Error getting session:", error)
        setIsSupabaseAvailable(false)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null)
        setIsLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error("Error setting up auth listener:", error)
      setIsSupabaseAvailable(false)
      setIsLoading(false)
      return () => {}
    }
  }, [supabaseAvailable])

  return <AuthContext.Provider value={{ user, isLoading, isSupabaseAvailable }}>{children}</AuthContext.Provider>
}
