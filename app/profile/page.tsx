"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?message=You must be logged in to view your profile")
    }
  }, [user, authLoading, router])

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, full_name, bio, avatar_url")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
          return
        }

        if (data) {
          setUsername(data.username || "")
          setFullName(data.full_name || "")
          setBio(data.bio || "")
        }
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          full_name: fullName,
          bio,
        })
        .eq("id", user.id)

      if (error) {
        setError(error.message)
      } else {
        setSuccess("Profile updated successfully!")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">Your Profile</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="min-h-[100px]"
              />
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
          </p>
          <Button variant="outline" size="sm">
            Change Password
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
