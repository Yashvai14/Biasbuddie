"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, Flag, AlertTriangle, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { checkToxicContent } from "@/lib/bias-analyzer"
import { motion, AnimatePresence } from "framer-motion"

export interface Comment {
  id: string
  author: string
  authorAvatar?: string
  content: string
  timestamp: string
  likes: number
  dislikes: number
  replies?: Comment[]
}

interface CommentSectionProps {
  comments: Comment[]
  onAddComment: (content: string) => void
}

export default function CommentSection({ comments, onAddComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toxicWarning, setToxicWarning] = useState<{ isToxic: boolean; reason?: string } | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsChecking(true)

    // Simulate a small delay for the toxicity check to feel more like an AI process
    setTimeout(() => {
      // Check for toxic content
      const toxicCheck = checkToxicContent(newComment)
      setIsChecking(false)

      if (toxicCheck.isToxic) {
        setToxicWarning(toxicCheck)
        return
      }

      setIsSubmitting(true)

      // Submit comment
      onAddComment(newComment)

      // Reset state
      setNewComment("")
      setToxicWarning(null)
      setIsSubmitting(false)
    }, 800)
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value)
    // Clear toxic warning when user edits the comment
    if (toxicWarning) {
      setToxicWarning(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>

      <motion.div
        className="border rounded-lg p-4 bg-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h4 className="text-sm font-medium mb-2">Add a comment</h4>
        <Textarea
          placeholder="Share your thoughts..."
          value={newComment}
          onChange={handleCommentChange}
          className="mb-3 transition-all duration-200 focus:ring-2 focus:ring-primary/50"
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

        <Button
          onClick={handleSubmitComment}
          disabled={!newComment.trim() || isSubmitting || isChecking}
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
      </motion.div>

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CommentItem comment={comment} formatDate={formatDate} />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          className="text-center py-8 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </motion.div>
      )}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  formatDate: (date: string) => string
  isReply?: boolean
}

function CommentItem({ comment, formatDate, isReply = false }: CommentItemProps) {
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [likes, setLikes] = useState(comment.likes)
  const [dislikes, setDislikes] = useState(comment.dislikes)
  const [isLikeAnimating, setIsLikeAnimating] = useState(false)
  const [isDislikeAnimating, setIsDislikeAnimating] = useState(false)

  const handleLike = () => {
    if (liked) {
      setLiked(false)
      setLikes(likes - 1)
    } else {
      setLiked(true)
      setIsLikeAnimating(true)
      setLikes(likes + 1)
      if (disliked) {
        setDisliked(false)
        setDislikes(dislikes - 1)
      }
    }
  }

  const handleDislike = () => {
    if (disliked) {
      setDisliked(false)
      setDislikes(dislikes - 1)
    } else {
      setDisliked(true)
      setIsDislikeAnimating(true)
      setDislikes(dislikes + 1)
      if (liked) {
        setLiked(false)
        setLikes(likes - 1)
      }
    }
  }

  useEffect(() => {
    if (isLikeAnimating) {
      const timer = setTimeout(() => setIsLikeAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isLikeAnimating])

  useEffect(() => {
    if (isDislikeAnimating) {
      const timer = setTimeout(() => setIsDislikeAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isDislikeAnimating])

  return (
    <motion.div
      className={`${isReply ? "pl-6 border-l" : "border rounded-lg"} p-4 bg-card shadow-sm hover:shadow-md transition-shadow duration-200`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 ring-2 ring-primary/10">
          {comment.authorAvatar ? (
            <AvatarImage src={comment.authorAvatar || "/placeholder.svg"} alt={comment.author} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary">{comment.author[0].toUpperCase()}</AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{comment.author}</span>
            <span className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</span>
          </div>

          <p className="text-sm mb-3 leading-relaxed">{comment.content}</p>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 text-muted-foreground relative ${liked ? "text-primary" : ""}`}
              onClick={handleLike}
            >
              <ThumbsUp className={`h-4 w-4 mr-1 ${liked ? "fill-current text-primary" : ""}`} />
              <motion.span animate={isLikeAnimating ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.5 }}>
                {likes}
              </motion.span>
              {isLikeAnimating && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-primary/10"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 text-muted-foreground relative ${disliked ? "text-destructive" : ""}`}
              onClick={handleDislike}
            >
              <ThumbsDown className={`h-4 w-4 mr-1 ${disliked ? "fill-current text-destructive" : ""}`} />
              <motion.span animate={isDislikeAnimating ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.5 }}>
                {dislikes}
              </motion.span>
              {isDislikeAnimating && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-destructive/10"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Flag className="h-4 w-4 mr-1" />
              <span>Report</span>
            </Button>
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} formatDate={formatDate} isReply={true} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
