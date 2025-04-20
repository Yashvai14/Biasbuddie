"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { voteOnForumPost } from "@/lib/actions/forum"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

interface ForumVoteButtonsProps {
  postId: string
  votes: number
  showCount?: boolean
}

export default function ForumVoteButtons({ postId, votes: initialVotes, showCount = true }: ForumVoteButtonsProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [isVoting, setIsVoting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleVote = async (voteType: "up" | "down") => {
    if (!user) {
      router.push("/login?message=You must be logged in to vote")
      return
    }

    setIsVoting(true)

    try {
      const result = await voteOnForumPost(postId, voteType)

      if (result.success) {
        setVotes(result.votes)
      }
    } catch (error) {
      console.error("Error voting:", error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleVote("up")}
        disabled={isVoting}
        className="flex items-center text-muted-foreground hover:text-primary transition-colors"
      >
        <ThumbsUp className="h-4 w-4" />
      </button>

      {showCount && <span className="text-sm mx-1">{votes}</span>}

      <button
        onClick={() => handleVote("down")}
        disabled={isVoting}
        className="flex items-center text-muted-foreground hover:text-primary transition-colors"
      >
        <ThumbsDown className="h-4 w-4" />
      </button>
    </div>
  )
}
