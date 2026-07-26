import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseServerConfig } from "@/lib/supabase-server"

const updateSchema = z.object({
  orderCode: z.string().regex(/^ESA-[A-Z0-9]{6}$/),
  status: z.enum(["received", "preparing", "ready", "collected", "cancelled"]),
})

export async function GET(request: Request) {
  const pin = request.headers.get("x-admin-pin")
  if (!pin || pin.length > 80) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const config = getSupabaseServerConfig()
  if (!config) {
    return NextResponse.json({ error: "Database is not connected." }, { status: 503 })
  }

  const { data, error } = await config.client.rpc("admin_list_orders", {
    p_backend_secret: config.backendSecret,
    p_admin_pin: pin,
  })

  if (error) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  })
}

export async function PATCH(request: Request) {
  const pin = request.headers.get("x-admin-pin")
  if (!pin || pin.length > 80) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const parsed = updateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status update." }, { status: 400 })
  }

  const config = getSupabaseServerConfig()
  if (!config) {
    return NextResponse.json({ error: "Database is not connected." }, { status: 503 })
  }

  const { data, error } = await config.client.rpc("admin_update_order", {
    p_backend_secret: config.backendSecret,
    p_admin_pin: pin,
    p_order_code: parsed.data.orderCode,
    p_status: parsed.data.status,
  })

  if (error || !data) {
    return NextResponse.json({ error: "Could not update order." }, { status: 401 })
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  })
}
