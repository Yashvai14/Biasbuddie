"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Copy, AlertTriangle } from "lucide-react"

export default function SetupPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [siteUrl, setSiteUrl] = useState("")

  useEffect(() => {
    // Set default site URL based on window location
    if (typeof window !== "undefined") {
      setSiteUrl(window.location.origin)
    }
  }, [])

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const envVars = [
    { name: "NEXT_PUBLIC_SUPABASE_URL", value: supabaseUrl, setter: setSupabaseUrl },
    { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: supabaseKey, setter: setSupabaseKey },
    { name: "NEXT_PUBLIC_SITE_URL", value: siteUrl, setter: setSiteUrl },
  ]

  const envFileContent = envVars.map((v) => `${v.name}=${v.value}`).join("\n")

  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Supabase Setup Guide</h1>

      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Your Supabase environment variables are missing. Follow the steps below to set them up.
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Create a Supabase Project</CardTitle>
            <CardDescription>
              Go to{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                supabase.com
              </a>{" "}
              and create a new project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Sign up or log in to Supabase</li>
              <li>Click "New Project"</li>
              <li>Fill in your project details and create the project</li>
              <li>Wait for your database to be ready</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 2: Get Your API Keys</CardTitle>
            <CardDescription>Find your API keys in the Supabase dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>In your project dashboard, go to Settings &gt; API</li>
              <li>Copy the "Project URL" and "anon public" key</li>
              <li>Enter them below:</li>
            </ol>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supabaseUrl">Project URL</Label>
                <Input
                  id="supabaseUrl"
                  placeholder="https://your-project-id.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supabaseKey">Anon Public Key</Label>
                <Input
                  id="supabaseKey"
                  placeholder="your-anon-key"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  placeholder="http://localhost:3000"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 3: Add Environment Variables</CardTitle>
            <CardDescription>Add these variables to your project's environment.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md relative">
              <pre className="whitespace-pre-wrap text-sm">{envFileContent}</pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(envFileContent, "env")}
              >
                {copied === "env" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Add these to your <code>.env.local</code> file or to your deployment platform's environment variables.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              After adding the environment variables, restart your development server or redeploy your application.
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 4: Set Up Database Tables</CardTitle>
            <CardDescription>Create the necessary tables in your Supabase project.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Go to the SQL Editor in your Supabase dashboard and run the following SQL:</p>

            <div className="bg-muted p-4 rounded-md relative max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{`-- Create tables for news articles
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT,
  source_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  votes INTEGER DEFAULT 0,
  tags TEXT[],
  image_url TEXT
);

-- Create table for comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  article_id UUID NOT NULL REFERENCES news_articles(id),
  parent_id UUID REFERENCES comments(id),
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0
);

-- Create table for forum posts
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  category TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0
);

-- Create table for forum comments
CREATE TABLE forum_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  post_id UUID NOT NULL REFERENCES forum_posts(id),
  parent_id UUID REFERENCES forum_comments(id),
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0
);

-- Create table for user profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT
);

-- Create function to increment a column
CREATE OR REPLACE FUNCTION increment(table_name text, column_name text, row_id uuid)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE id = $1', table_name, column_name, column_name)
  USING row_id;
END;
$$ LANGUAGE plpgsql;`}</pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() =>
                  handleCopy(
                    `-- Create tables for news articles
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT,
  source_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  votes INTEGER DEFAULT 0,
  tags TEXT[],
  image_url TEXT
);

-- Create table for comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  article_id UUID NOT NULL REFERENCES news_articles(id),
  parent_id UUID REFERENCES comments(id),
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0
);

-- Create table for forum posts
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  category TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0
);

-- Create table for forum comments
CREATE TABLE forum_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  post_id UUID NOT NULL REFERENCES forum_posts(id),
  parent_id UUID REFERENCES forum_comments(id),
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0
);

-- Create table for user profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT
);

-- Create function to increment a column
CREATE OR REPLACE FUNCTION increment(table_name text, column_name text, row_id uuid)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE id = $1', table_name, column_name, column_name)
  USING row_id;
END;
$$ LANGUAGE plpgsql;`,
                    "sql",
                  )
                }
              >
                {copied === "sql" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
