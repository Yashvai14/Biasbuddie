"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown } from "lucide-react"
import { voteOnArticle } from "@/lib/actions/news"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

interface NewsVoteButtonsProps {
  articleId: string
  votes: number
}

export default function NewsVoteButtons({ articleId, votes: initialVotes }: NewsVoteButtonsProps) {
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
      const result = await voteOnArticle(articleId, voteType)

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
    <>
      <Button variant="ghost" size="icon" onClick={() => handleVote("up")} className="h-8 w-8" disabled={isVoting}>
        <ArrowUp className="h-5 w-5" />
      </Button>
      <span className="font-medium text-lg my-1">{votes}</span>
      <Button variant="ghost" size="icon" onClick={() => handleVote("down")} className="h-8 w-8" disabled={isVoting}>
        <ArrowDown className="h-5 w-5" />
      </Button>
    </>
  )
}
