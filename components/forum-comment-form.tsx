"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"
import { addForumComment } from "@/lib/actions/forum"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { checkToxicContent } from "@/lib/bias-analyzer"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface ForumCommentFormProps {
  postId: string
  parentId?: string
  onSuccess?: () => void
}

export default function ForumCommentForm({ postId, parentId, onSuccess }: ForumCommentFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toxicWarning, setToxicWarning] = useState<{ isToxic: boolean; reason?: string } | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push("/login?message=You must be logged in to comment")
      return
    }

    if (!content.trim()) return

    // First check for toxic content
    setIsChecking(true)
    setError(null)

    // Simulate a small delay for the toxicity check to feel more like an AI process
    setTimeout(() => {
      const toxicCheck = checkToxicContent(content)
      setIsChecking(false)

      if (toxicCheck.isToxic) {
        setToxicWarning(toxicCheck)
        toast({
          title: "Comment Blocked",
          description: `Your comment contains ${toxicCheck.reason?.toLowerCase() || "inappropriate content"}. Please revise your comment.`,
          variant: "destructive",
        })
        return
      }

      // If not toxic, proceed with submission
      submitComment()
    }, 800)
  }

  const submitComment = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("content", content)
      formData.append("postId", postId)
      if (parentId) {
        formData.append("parentId", parentId)
      }

      const result = await addForumComment(formData)

      if (result.success) {
        setContent("")
        setToxicWarning(null)
        toast({
          title: "Comment Posted",
          description: "Your comment has been posted successfully.",
        })
        if (onSuccess) {
          onSuccess()
        }
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    // Clear toxic warning when user edits the comment
    if (toxicWarning) {
      setToxicWarning(null)
    }
  }

  return (
    <motion.div
      className="border rounded-lg p-4 mb-6 shadow-sm hover:shadow-md transition-all duration-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h4 className="text-sm font-medium mb-2">{parentId ? "Reply to comment" : "Add a comment"}</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Share your thoughts..."
          value={content}
          onChange={handleContentChange}
          className="mb-3 transition-all duration-200 focus:ring-2 focus:ring-primary/50"
          disabled={isSubmitting || isChecking}
        />

        <AnimatePresence>
          {toxicWarning && toxicWarning.isToxic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Alert variant="destructive" className="mb-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Comment Blocked</AlertTitle>
                <AlertDescription>
                  Your comment contains {toxicWarning.reason?.toLowerCase() || "inappropriate content"}. Please revise
                  your comment to follow our community guidelines.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || isChecking || !content.trim()}
          className="relative overflow-hidden group"
        >
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              Post Comment
              <span className="absolute inset-0 w-full h-full bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
            </>
          )}
        </Button>
      </form>
    </motion.div>
  )
}
