"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import { createForumPost } from "@/lib/actions/forum"
import { useAuth } from "@/components/auth-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function NewDiscussionPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Redirect if not logged in
  if (!isLoading && !user) {
    router.push("/login?message=You must be logged in to create a discussion")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      formData.append("category", category)

      const result = await createForumPost(formData)

      if (result?.error) {
        setError(result.error)
        setIsSubmitting(false)
      } else if (result?.success) {
        // Handle success in preview environment
        setSuccess(result.message || "Discussion created successfully!")
        toast({
          title: "Success",
          description: "Your discussion has been created successfully!",
        })

        // Clear form
        setTitle("")
        setContent("")
        setCategory("")

        // Redirect after a delay
        setTimeout(() => {
          router.push("/forum")
        }, 2000)
      }
      // If no result is returned, the redirect happened server-side
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10 max-w-4xl">
      <div className="mb-6">
        <Link href="/forum">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Start a New Discussion</CardTitle>
          <CardDescription>Share your thoughts and questions with the community</CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title for your discussion"
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/50">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Media Analysis">Media Analysis</SelectItem>
                  <SelectItem value="Writing Tools">Writing Tools</SelectItem>
                  <SelectItem value="Philosophy">Philosophy</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, questions, or ideas..."
                className="min-h-[200px] transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !title || !content || !category}
              className="w-full relative overflow-hidden group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Discussion...
                </>
              ) : (
                <>
                  Create Discussion
                  <span className="absolute inset-0 w-full h-full bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Please ensure your discussion follows our community guidelines
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
