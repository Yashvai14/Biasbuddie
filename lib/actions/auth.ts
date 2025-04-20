"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import type { Database } from "@/lib/supabase/database.types"

// Helper function to check if Supabase environment variables are available
function checkSupabaseEnv() {
  if (
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== "string" ||
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "string"
  ) {
    return { error: "Supabase environment variables are missing. Please configure them first." }
  }
  return null
}

// Helper to check if we're in a preview environment
function isPreviewEnvironment() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.includes("vusercontent.net") ||
    process.env.VERCEL_ENV === "preview" ||
    process.env.NODE_ENV === "development"
  )
}

export async function signUp(formData: FormData) {
  const envCheck = checkSupabaseEnv()
  if (envCheck) return envCheck

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  const supabase = createServerActionClient<Database>({ cookies })

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create a profile for the user
  if (data.user) {
    const username = email.split("@")[0] + Math.floor(Math.random() * 1000)

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username,
      full_name: name,
    })

    if (profileError) {
      return { error: profileError.message }
    }
  }

  // In preview environments, return success instead of redirecting
  if (isPreviewEnvironment()) {
    return {
      success: true,
      message: "Account created successfully! Check your email to confirm your account.",
    }
  }

  // In production, redirect as normal
  redirect("/login?message=Check your email to confirm your account")
}

export async function signIn(formData: FormData) {
  const envCheck = checkSupabaseEnv()
  if (envCheck) return envCheck

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = createServerActionClient<Database>({ cookies })

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // In preview environments, return success instead of redirecting
  if (isPreviewEnvironment()) {
    return { success: true }
  }

  // In production, redirect as normal
  redirect("/")
}

export async function signOut() {
  const envCheck = checkSupabaseEnv()
  if (envCheck) return envCheck

  const supabase = createServerActionClient<Database>({ cookies })
  await supabase.auth.signOut()

  // In preview environments, return success instead of redirecting
  if (isPreviewEnvironment()) {
    return { success: true }
  }

  // In production, redirect as normal
  redirect("/")
}

export async function signInWithGoogle() {
  const envCheck = checkSupabaseEnv()
  if (envCheck) return envCheck

  const supabase = createServerActionClient<Database>({ cookies })

  // For preview environments, we'll use a different approach
  if (isPreviewEnvironment()) {
    // In preview, just return a message
    // This avoids OAuth redirect issues in preview environments
    return {
      error: "Google Sign-In is not available in preview mode. Please use email/password authentication instead.",
    }
  }

  // For production environments, proceed with normal OAuth flow
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect(data.url)
}
