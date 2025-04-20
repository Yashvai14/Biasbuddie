"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, Flag, Reply } from "lucide-react"
import CommentForm from "./comment-form"
import { useAuth } from "@/components/auth-provider"

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  article_id: string
  parent_id: string | null
  likes: number
  dislikes: number
  profiles?: {
    username: string | null
    avatar_url: string | null
  }
}

interface CommentListProps {
  comments: Comment[]
  formatDate: (date: string) => string
}

export default function CommentList({ comments, formatDate }: CommentListProps) {
  // Organize comments into a tree structure
  const commentsByParentId: Record<string, Comment[]> = {}
  const rootComments: Comment[] = []

  comments.forEach((comment) => {
    if (comment.parent_id) {
      if (!commentsByParentId[comment.parent_id]) {
        commentsByParentId[comment.parent_id] = []
      }
      commentsByParentId[comment.parent_id].push(comment)
    } else {
      rootComments.push(comment)
    }
  })

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No comments yet. Be the first to share your thoughts!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-6">
      {rootComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replies={commentsByParentId[comment.id] || []}
          formatDate={formatDate}
          commentsByParentId={commentsByParentId}
        />
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  replies: Comment[]
  formatDate: (date: string) => string
  commentsByParentId: Record<string, Comment[]>
  isReply?: boolean
}

function CommentItem({ comment, replies, formatDate, commentsByParentId, isReply = false }: CommentItemProps) {
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [likes, setLikes] = useState(comment.likes)
  const [dislikes, setDislikes] = useState(comment.dislikes)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const { user } = useAuth()

  const username = comment.profiles?.username || comment.user_id.substring(0, 8)
  const avatarFallback = username.charAt(0).toUpperCase()

  const handleLike = () => {
    if (liked) {
      setLiked(false)
      setLikes(likes - 1)
    } else {
      setLiked(true)
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
      setDislikes(dislikes + 1)
      if (liked) {
        setLiked(false)
        setLikes(likes - 1)
      }
    }
  }

  const handleReplySuccess = () => {
    setShowReplyForm(false)
  }

  return (
    <div className={`${isReply ? "pl-6 border-l" : "border rounded-lg"} p-4`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{username}</span>
            <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
          </div>

          <p className="text-sm mb-3">{comment.content}</p>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={handleLike}>
              <ThumbsUp className={`h-4 w-4 mr-1 ${liked ? "fill-current text-primary" : ""}`} />
              <span>{likes}</span>
            </Button>

            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={handleDislike}>
              <ThumbsDown className={`h-4 w-4 mr-1 ${disliked ? "fill-current text-primary" : ""}`} />
              <span>{dislikes}</span>
            </Button>

            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="h-4 w-4 mr-1" />
                <span>Reply</span>
              </Button>
            )}

            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
              <Flag className="h-4 w-4 mr-1" />
              <span>Report</span>
            </Button>
          </div>

          {showReplyForm && (
            <div className="mt-4">
              <CommentForm articleId={comment.article_id} parentId={comment.id} onSuccess={handleReplySuccess} />
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={commentsByParentId[reply.id] || []}
              formatDate={formatDate}
              commentsByParentId={commentsByParentId}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
