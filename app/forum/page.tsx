import ForumFallback from "@/components/forum-fallback"

// Make this a dynamic page that doesn't get pre-rendered during build
export const dynamic = "force-dynamic"

export default function ForumPage() {
  return <ForumFallback />
}
