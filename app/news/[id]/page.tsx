import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import NewsArticleFallback from "@/components/news-article-fallback"

// Make this a dynamic page that doesn't get pre-rendered during build
export const dynamic = "force-dynamic"

interface NewsArticlePageProps {
  params: {
    id: string
  }
}

export default function NewsArticlePage({ params }: NewsArticlePageProps) {
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

      <NewsArticleFallback id={params.id} />
    </div>
  )
}
