"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, Share2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import ForumVoteButtons from "@/components/forum-vote-buttons"
import ForumCommentForm from "@/components/forum-comment-form"
import ForumCommentList from "@/components/forum-comment-list"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"

interface ForumDiscussionFallbackProps {
  id: string
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function ForumDiscussionFallback({ id }: ForumDiscussionFallbackProps) {
  const [discussion, setDiscussion] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isSupabaseAvailable } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchDiscussion() {
      if (!isSupabaseAvailable) {
        setIsLoading(false)
        return
      }

      // Special case for "new-discussion" path
      if (id === "new-discussion") {
        setError("Invalid discussion ID")
        setIsLoading(false)
        return
      }

      // Validate UUID format before querying
      if (!UUID_REGEX.test(id)) {
        console.error("Invalid discussion ID format:", id)
        setError("Invalid discussion ID format")
        setIsLoading(false)
        return
      }

      try {
        const supabase = createClient()

        // Fetch discussion without the join
        const { data: discussionData, error: discussionError } = await supabase
          .from("forum_posts")
          .select("*")
          .eq("id", id)
          .single()

        if (discussionError) {
          console.error("Error fetching forum post:", discussionError)
          setError("Discussion not found")
          setIsLoading(false)
          return
        }

        // Fetch the profile separately
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", discussionData.user_id)
          .single()

        // Combine the data
        const discussionWithProfile = {
          ...discussionData,
          profiles: profileError ? null : profileData,
        }

        setDiscussion(discussionWithProfile)

        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from("forum_comments")
          .select("*")
          .eq("post_id", id)
          .order("created_at", { ascending: true })

        if (commentsError) {
          console.error("Error fetching forum comments:", commentsError)
          setComments([])
        } else if (commentsData && commentsData.length > 0) {
          // If we have comments, fetch the profiles for each comment
          const userIds = [...new Set(commentsData.map((comment) => comment.user_id))]

          const { data: commentProfilesData, error: commentProfilesError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", userIds)

          if (commentProfilesError) {
            console.error("Error fetching comment profiles:", commentProfilesError)
            setComments(commentsData)
          } else {
            // Create a map of user_id to profile data
            const profileMap = (commentProfilesData || []).reduce((map, profile) => {
              map[profile.id] = profile
              return map
            }, {})

            // Merge comment data with profile data
            const commentsWithProfiles = commentsData.map((comment) => ({
              ...comment,
              profiles: profileMap[comment.user_id] || null,
            }))

            setComments(commentsWithProfiles)
          }
        } else {
          setComments([])
        }
      } catch (err) {
        console.error("Error:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiscussion()
  }, [id, isSupabaseAvailable, router])

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isSupabaseAvailable) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Database Not Configured</h2>
        <p className="text-muted-foreground mb-6">
          Please set up your Supabase environment variables to access the forum.
        </p>
        <Link href="/setup">
          <Button>Go to Setup Guide</Button>
        </Link>
      </div>
    )
  }

  if (error || !discussion) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Discussion Not Found</h2>
        <p className="text-muted-foreground mb-6">
          {error || "The discussion you're looking for doesn't exist or has been removed."}
        </p>
        <Link href="/forum">
          <Button>Back to Forum</Button>
        </Link>
      </div>
    )
  }

  const username = discussion.profiles?.username || discussion.user_id.substring(0, 8)
  const avatarFallback = username.charAt(0).toUpperCase()

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{discussion.category}</Badge>
            <span className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(discussion.created_at)}
            </span>
          </div>
          <CardTitle className="text-2xl">{discussion.title}</CardTitle>
          <CardDescription className="flex items-center mt-2">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <span>{username}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            {discussion.content.split("\n\n").map((paragraph: string, i: number) => (
              <p key={i} className="mb-4">
                {paragraph.includes("\n")
                  ? paragraph.split("\n").map((line: string, j: number) => (
                      <span key={j}>
                        {line.startsWith("- ") ? <span className="block ml-4">• {line.substring(2)}</span> : line}
                        {j < paragraph.split("\n").length - 1 && <br />}
                      </span>
                    ))
                  : paragraph}
              </p>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-6 pt-4 border-t">
            <ForumVoteButtons postId={discussion.id} votes={discussion.votes} showCount={true} />

            <Button variant="outline" size="sm" className="gap-2 ml-auto">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-6">Comments ({comments.length})</h3>
          <ForumCommentForm postId={discussion.id} />
          <ForumCommentList comments={comments} formatDate={formatDate} />
        </CardContent>
      </Card>
    </>
  )
}
