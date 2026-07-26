import { NextResponse } from "next/server"
import { getSupabaseServerConfig } from "@/lib/supabase-server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params
  const normalizedCode = code.trim().toUpperCase()

  if (!/^ESA-[A-Z0-9]{6}$/.test(normalizedCode)) {
    return NextResponse.json({ error: "Invalid order code." }, { status: 400 })
  }

  const config = getSupabaseServerConfig()
  if (!config) {
    return NextResponse.json({ error: "Order tracking is not connected yet." }, { status: 503 })
  }

  const { data, error } = await config.client.rpc("track_order", {
    p_backend_secret: config.backendSecret,
    p_order_code: normalizedCode,
  })

  if (error || !data) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 })
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  })
}
