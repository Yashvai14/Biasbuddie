"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Share2, Clock, ExternalLink, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import NewsVoteButtons from "@/components/news-vote-buttons"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"

export default function NewsFallback() {
  const [newsArticles, setNewsArticles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isSupabaseAvailable } = useAuth()

  useEffect(() => {
    async function fetchNewsArticles() {
      if (!isSupabaseAvailable) {
        setIsLoading(false)
        return
      }

      try {
        const supabase = createClient()

        // First, fetch the news articles without the join
        const { data: articlesData, error: articlesError } = await supabase
          .from("news_articles")
          .select("*")
          .order("created_at", { ascending: false })

        if (articlesError) {
          console.error("Error fetching news articles:", articlesError)
          setNewsArticles([])
          setIsLoading(false)
          return
        }

        // If we have articles, fetch the profiles separately and merge the data
        if (articlesData && articlesData.length > 0) {
          // Get unique user IDs
          const userIds = [...new Set(articlesData.map((article) => article.user_id))]

          // Fetch profiles for these users
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", userIds)

          if (profilesError) {
            console.error("Error fetching profiles:", profilesError)
            // Continue with articles but without profile data
            setNewsArticles(articlesData)
          } else {
            // Create a map of user_id to profile data
            const profileMap = (profilesData || []).reduce((map, profile) => {
              map[profile.id] = profile
              return map
            }, {})

            // Merge article data with profile data
            const articlesWithProfiles = articlesData.map((article) => ({
              ...article,
              profiles: profileMap[article.user_id] || null,
            }))

            setNewsArticles(articlesWithProfiles)
          }
        } else {
          setNewsArticles([])
        }
      } catch (err) {
        console.error("Error:", err)
        setNewsArticles([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNewsArticles()
  }, [isSupabaseAvailable])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="container py-10 max-w-4xl flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isSupabaseAvailable) {
    return (
      <div className="container py-10 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Database Not Configured</h2>
          <p className="text-muted-foreground mb-6">
            Please set up your Supabase environment variables to access the news section.
          </p>
          <Link href="/setup">
            <Button>Go to Setup Guide</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">News Feed</h1>
        <Link href="/news/submit">
          <Button>Submit News</Button>
        </Link>
      </div>

      <Tabs defaultValue="trending" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="top">Top Rated</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-4">
          <div className="space-y-4">
            {newsArticles
              .sort((a, b) => b.votes - a.votes)
              .map((article) => (
                <NewsCard key={article.id} article={article} formatDate={formatDate} />
              ))}

            {newsArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No news articles yet. Be the first to submit one!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <div className="space-y-4">
            {newsArticles
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((article) => (
                <NewsCard key={article.id} article={article} formatDate={formatDate} />
              ))}

            {newsArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No news articles yet. Be the first to submit one!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="top" className="mt-4">
          <div className="space-y-4">
            {newsArticles
              .sort((a, b) => b.votes - a.votes)
              .map((article) => (
                <NewsCard key={article.id} article={article} formatDate={formatDate} />
              ))}

            {newsArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No news articles yet. Be the first to submit one!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NewsCard({ article, formatDate }: any) {
  // Get username from profiles or fallback to user_id
  const username = article.profiles?.username || article.user_id.substring(0, 8)
  const avatarFallback = username.charAt(0).toUpperCase()

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex">
          <div className="flex flex-col items-center justify-start p-4 border-r bg-muted/30">
            <NewsVoteButtons articleId={article.id} votes={article.votes} />
          </div>

          <div className="flex-1 p-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {article.tags &&
                article.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
            </div>

            <Link href={`/news/${article.id}`}>
              <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">{article.title}</h3>
            </Link>
            <p className="text-muted-foreground mb-3">{article.description}</p>

            <div className="flex items-center text-sm text-muted-foreground mb-3">
              {article.source && (
                <>
                  <span className="flex items-center">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    {article.source}
                  </span>
                  <span className="mx-2">•</span>
                </>
              )}
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatDate(article.created_at)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{username}</span>
              </div>

              <div className="flex gap-2">
                <Link href={`/news/${article.id}`}>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>Comments</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
