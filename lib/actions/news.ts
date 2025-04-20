"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import type { Database } from "@/lib/supabase/database.types"
import { revalidatePath } from "next/cache"

export async function submitNews(formData: FormData) {
  const supabase = createServerActionClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "You must be logged in to submit news" }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const content = formData.get("content") as string
  const source = formData.get("source") as string
  const sourceUrl = formData.get("sourceUrl") as string
  const tagsString = formData.get("tags") as string
  const tags = tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

  const { data, error } = await supabase
    .from("news_articles")
    .insert({
      title,
      description,
      content,
      source,
      source_url: sourceUrl,
      user_id: session.user.id,
      tags,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/news")
  redirect("/news")
}

export async function getNewsArticles() {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data, error } = await supabase
    .from("news_articles")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching news articles:", error)
    return []
  }

  return data
}

export async function getNewsArticle(id: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data, error } = await supabase
    .from("news_articles")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching news article:", error)
    return null
  }

  return data
}

export async function voteOnArticle(articleId: string, voteType: "up" | "down") {
  const supabase = createServerActionClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "You must be logged in to vote" }
  }

  // Get current article
  const { data: article } = await supabase.from("news_articles").select("votes").eq("id", articleId).single()

  if (!article) {
    return { error: "Article not found" }
  }

  // Update votes
  const newVotes = voteType === "up" ? article.votes + 1 : article.votes - 1

  const { error } = await supabase.from("news_articles").update({ votes: newVotes }).eq("id", articleId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/news/${articleId}`)
  revalidatePath("/news")

  return { success: true, votes: newVotes }
}

export async function addComment(formData: FormData) {
  const supabase = createServerActionClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "You must be logged in to comment" }
  }

  const content = formData.get("content") as string
  const articleId = formData.get("articleId") as string
  const parentId = (formData.get("parentId") as string) || null

  const { data, error } = await supabase
    .from("comments")
    .insert({
      content,
      article_id: articleId,
      user_id: session.user.id,
      parent_id: parentId,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/news/${articleId}`)

  return { success: true, comment: data[0] }
}

export async function getComments(articleId: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq("article_id", articleId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching comments:", error)
    return []
  }

  return data
}
