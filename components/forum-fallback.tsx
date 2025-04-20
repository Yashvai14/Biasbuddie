"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Clock, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import ForumVoteButtons from "@/components/forum-vote-buttons"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"

export default function ForumFallback() {
  const [discussions, setDiscussions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isSupabaseAvailable } = useAuth()

  useEffect(() => {
    async function fetchDiscussions() {
      if (!isSupabaseAvailable) {
        setIsLoading(false)
        return
      }

      try {
        const supabase = createClient()

        // First, fetch the forum posts without the join
        const { data: postsData, error: postsError } = await supabase
          .from("forum_posts")
          .select("*")
          .order("created_at", { ascending: false })

        if (postsError) {
          console.error("Error fetching forum posts:", postsError)
          setDiscussions([])
          setIsLoading(false)
          return
        }

        // If we have posts, fetch the profiles separately and merge the data
        if (postsData && postsData.length > 0) {
          // Get unique user IDs
          const userIds = [...new Set(postsData.map((post) => post.user_id))]

          // Fetch profiles for these users
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", userIds)

          if (profilesError) {
            console.error("Error fetching profiles:", profilesError)
            // Continue with posts but without profile data
            setDiscussions(postsData)
          } else {
            // Create a map of user_id to profile data
            const profileMap = (profilesData || []).reduce((map, profile) => {
              map[profile.id] = profile
              return map
            }, {})

            // Merge post data with profile data
            const postsWithProfiles = postsData.map((post) => ({
              ...post,
              profiles: profileMap[post.user_id] || null,
            }))

            setDiscussions(postsWithProfiles)
          }
        } else {
          setDiscussions([])
        }
      } catch (err) {
        console.error("Error:", err)
        setDiscussions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiscussions()
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
            Please set up your Supabase environment variables to access the forum.
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Community Forum</h1>
        <Link href="/forum/new-discussion">
          <Button>Start Discussion</Button>
        </Link>
      </div>

      <div className="mb-6">
        <form>
          <Input placeholder="Search discussions..." name="search" className="max-w-md" />
        </form>
      </div>

      <Tabs defaultValue="all" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Topics</TabsTrigger>
          <TabsTrigger value="media">Media Analysis</TabsTrigger>
          <TabsTrigger value="writing">Writing Tools</TabsTrigger>
          <TabsTrigger value="philosophy">Philosophy</TabsTrigger>
          <TabsTrigger value="technology">Technology</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <DiscussionCard key={discussion.id} discussion={discussion} formatDate={formatDate} />
            ))}

            {discussions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No discussions yet. Be the first to start one!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <div className="space-y-4">
            {discussions
              .filter((d) => d.category === "Media Analysis")
              .map((discussion) => (
                <DiscussionCard key={discussion.id} discussion={discussion} formatDate={formatDate} />
              ))}

            {discussions.filter((d) => d.category === "Media Analysis").length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No discussions in this category yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="writing" className="mt-4">
          <div className="space-y-4">
            {discussions
              .filter((d) => d.category === "Writing Tools")
              .map((discussion) => (
                <DiscussionCard key={discussion.id} discussion={discussion} formatDate={formatDate} />
              ))}

            {discussions.filter((d) => d.category === "Writing Tools").length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No discussions in this category yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="philosophy" className="mt-4">
          <div className="space-y-4">
            {discussions
              .filter((d) => d.category === "Philosophy")
              .map((discussion) => (
                <DiscussionCard key={discussion.id} discussion={discussion} formatDate={formatDate} />
              ))}

            {discussions.filter((d) => d.category === "Philosophy").length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No discussions in this category yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="technology" className="mt-4">
          <div className="space-y-4">
            {discussions
              .filter((d) => d.category === "Technology")
              .map((discussion) => (
                <DiscussionCard key={discussion.id} discussion={discussion} formatDate={formatDate} />
              ))}

            {discussions.filter((d) => d.category === "Technology").length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No discussions in this category yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DiscussionCard({ discussion, formatDate }: any) {
  const username = discussion.profiles?.username || discussion.user_id.substring(0, 8)
  const avatarFallback = username.charAt(0).toUpperCase()

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">
              <Link href={`/forum/discussion/${discussion.id}`} className="hover:text-primary transition-colors">
                {discussion.title}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="outline" className="mr-2">
                {discussion.category}
              </Badge>
              <span className="flex items-center text-xs gap-1 inline-block">
                <Clock className="h-3 w-3" />
                {formatDate(discussion.created_at)}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-muted-foreground">{discussion.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{username}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-sm">
            <MessageSquare className="h-4 w-4" />
            {discussion.replies}
          </span>
          <ForumVoteButtons postId={discussion.id} votes={discussion.votes} />
        </div>
      </CardFooter>
    </Card>
  )
}
