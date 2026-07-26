import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

export function getSupabaseServerConfig() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY
  const backendSecret = process.env.BACKEND_API_SECRET

  if (!url || !key || !backendSecret) return null

  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }

  return { client, backendSecret }
}
