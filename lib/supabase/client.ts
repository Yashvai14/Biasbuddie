import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

export function createClient() {
  // Check if environment variables are available
  if (
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== "string" ||
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "string"
  ) {
    console.warn("Supabase environment variables are missing. Authentication and database features will not work.")
    // Return a mock client that won't throw errors but won't work either
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ data: null, error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
    } as any
  }

  return createClientComponentClient<Database>()
}
