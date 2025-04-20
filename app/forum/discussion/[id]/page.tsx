import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ForumDiscussionFallback from "@/components/forum-discussion-fallback"

// Make this a dynamic page that doesn't get pre-rendered during build
export const dynamic = "force-dynamic"

interface DiscussionPageProps {
  params: {
    id: string
  }
}

export default function DiscussionPage({ params }: DiscussionPageProps) {
  return (
    <div className="container py-10 max-w-4xl">
      <div className="mb-6">
        <Link href="/forum">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Button>
        </Link>
      </div>

      <ForumDiscussionFallback id={params.id} />
    </div>
  )
}
