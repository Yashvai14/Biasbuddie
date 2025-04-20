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
import { ArrowLeft, Loader2 } from "lucide-react"
import { submitNews } from "@/lib/actions/news"
import { useAuth } from "@/components/auth-provider"

export default function SubmitNewsPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [source, setSource] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [tags, setTags] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if not logged in
  if (!isLoading && !user) {
    router.push("/login?message=You must be logged in to submit news")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("content", content)
      formData.append("source", source)
      formData.append("sourceUrl", sourceUrl)
      formData.append("tags", tags)

      const result = await submitNews(formData)

      if (result?.error) {
        setError(result.error)
        setIsSubmitting(false)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10 max-w-4xl">
      <div className="mb-6">
        <Link href="/news">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to News
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Submit News Article</CardTitle>
          <CardDescription>Share an interesting article with the community</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a brief summary of the article"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Full Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the full article content"
                className="min-h-[200px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g., The New York Times"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceUrl">Source URL</Label>
                <Input
                  id="sourceUrl"
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://example.com/article"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas (e.g., Politics, Media, Research)"
              />
              <p className="text-xs text-muted-foreground">
                Tags help categorize your article and make it more discoverable
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Article"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">Please ensure the content follows our community guidelines</p>
        </CardFooter>
      </Card>
    </div>
  )
}
