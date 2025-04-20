"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, ExternalLink, Share2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import NewsVoteButtons from "@/components/news-vote-buttons"
import CommentForm from "@/components/comment-form"
import CommentList from "@/components/comment-list"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"

interface NewsArticleFallbackProps {
  id: string
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function NewsArticleFallback({ id }: NewsArticleFallbackProps) {
  const [article, setArticle] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isSupabaseAvailable } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchArticle() {
      if (!isSupabaseAvailable) {
        setIsLoading(false)
        return
      }

      // Special case for "submit" path
      if (id === "submit") {
        setError("Invalid article ID")
        setIsLoading(false)
        return
      }

      // Validate UUID format before querying
      if (!UUID_REGEX.test(id)) {
        console.error("Invalid article ID format:", id)
        setError("Invalid article ID format")
        setIsLoading(false)
        return
      }

      try {
        const supabase = createClient()

        // Fetch article without the join
        const { data: articleData, error: articleError } = await supabase
          .from("news_articles")
          .select("*")
          .eq("id", id)
          .single()

        if (articleError) {
          console.error("Error fetching news article:", articleError)
          setError("Article not found")
          setIsLoading(false)
          return
        }

        // Fetch the profile separately
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", articleData.user_id)
          .single()

        // Combine the data
        const articleWithProfile = {
          ...articleData,
          profiles: profileError ? null : profileData,
        }

        setArticle(articleWithProfile)

        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .eq("article_id", id)
          .order("created_at", { ascending: true })

        if (commentsError) {
          console.error("Error fetching comments:", commentsError)
          setComments([])
        } else if (commentsData) {
          // If we have comments, fetch the profiles for each comment
          const userIds = [...new Set(commentsData.map((comment) => comment.user_id))]

          if (userIds.length > 0) {
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
            setComments(commentsData)
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

    fetchArticle()
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
          Please set up your Supabase environment variables to access the news section.
        </p>
        <Link href="/setup">
          <Button>Go to Setup Guide</Button>
        </Link>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
        <p className="text-muted-foreground mb-6">
          {error || "The article you're looking for doesn't exist or has been removed."}
        </p>
        <Link href="/news">
          <Button>Back to News</Button>
        </Link>
      </div>
    )
  }

  const username = article.profiles?.username || article.user_id.substring(0, 8)
  const avatarFallback = username.charAt(0).toUpperCase()

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {article.tags &&
              article.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            <span className="text-xs text-muted-foreground flex items-center ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(article.created_at)}
            </span>
          </div>
          <CardTitle className="text-2xl">{article.title}</CardTitle>
          <CardDescription className="mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <span>{username}</span>
              </div>
              {article.source && (
                <a
                  href={article.source_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  {article.source}
                </a>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex">
            <div className="flex flex-col items-center mr-4 p-2 border rounded-lg bg-muted/30">
              <NewsVoteButtons articleId={article.id} votes={article.votes} />
            </div>

            <div className="prose dark:prose-invert max-w-none flex-1">
              {article.content.split("\n\n").map((paragraph: string, i: number) => (
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
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-6">Comments ({comments.length})</h3>
          <CommentForm articleId={article.id} />
          <CommentList comments={comments} formatDate={formatDate} />
        </CardContent>
      </Card>
    </>
  )
}
