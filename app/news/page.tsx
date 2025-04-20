import NewsFallback from "@/components/news-fallback"

// Make this a dynamic page that doesn't get pre-rendered during build
export const dynamic = "force-dynamic"

export default function NewsPage() {
  return <NewsFallback />
}
