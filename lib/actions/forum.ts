"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import type { Database } from "@/lib/supabase/database.types"
import { revalidatePath } from "next/cache"

export async function createForumPost(formData: FormData) {
  const supabase = createServerActionClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "You must be logged in to create a post" }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const category = formData.get("category") as string

  const { data, error } = await supabase
    .from("forum_posts")
    .insert({
      title,
      content,
      category,
      user_id: session.user.id,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/forum")
  redirect("/forum")
}

export async function getForumPosts() {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data, error } = await supabase
    .from("forum_posts")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching forum posts:", error)
    return []
  }

  return data
}

export async function getForumPost(id: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data, error } = await supabase
    .from("forum_posts")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching forum post:", error)
    return null
  }

  return data
}

export async function voteOnForumPost(postId: string, voteType: "up" | "down") {
  const supabase = createServerActionClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "You must be logged in to vote" }
  }

  // Get current post
  const { data: post } = await supabase.from("forum_posts").select("votes").eq("id", postId).single()

  if (!post) {
    return { error: "Post not found" }
  }

  // Update votes
  const newVotes = voteType === "up" ? post.votes + 1 : post.votes - 1

  const { error } = await supabase.from("forum_posts").update({ votes: newVotes }).eq("id", postId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/forum/discussion/${postId}`)
  revalidatePath("/forum")

  return { success: true, votes: newVotes }
}

export async function addForumComment(formData: FormData) {
  const supabase = createServerActionClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "You must be logged in to comment" }
  }

  const content = formData.get("content") as string
  const postId = formData.get("postId") as string
  const parentId = (formData.get("parentId") as string) || null

  const { data, error } = await supabase
    .from("forum_comments")
    .insert({
      content,
      post_id: postId,
      user_id: session.user.id,
      parent_id: parentId,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  // Update reply count on the post
  const { error: updateError } = await supabase
    .from("forum_posts")
    .update({ replies: increment("replies", postId) })
    .eq("id", postId)

  if (updateError) {
    console.error("Error updating reply count:", updateError)
  }

  revalidatePath(`/forum/discussion/${postId}`)

  return { success: true, comment: data[0] }
}

// Helper function to increment a column
function increment(column: string, postId: string) {
  const supabase = createServerActionClient<Database>({ cookies })
  return supabase.rpc("increment", { table_name: "forum_posts", column_name: column, row_id: postId })
}

export async function getForumComments(postId: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data, error } = await supabase
    .from("forum_comments")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching forum comments:", error)
    return []
  }

  return data
}
