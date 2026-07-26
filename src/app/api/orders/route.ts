import { NextResponse } from "next/server"
import { z } from "zod"
import {
  OrderPricingError,
  priceOrderItems,
} from "@/lib/order-pricing"
import { getSupabaseServerConfig } from "@/lib/supabase-server"

const cartItemSchema = z.object({
  productId: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(20),
  selections: z.record(z.string(), z.string()).optional(),
}).strict()

const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone: z.string()
    .trim()
    .min(8)
    .max(24)
    .regex(/^[+0-9 ().-]+$/)
    .refine((value) => value.replace(/\D/g, "").length >= 8),
  fulfillment: z.enum(["pickup", "eat-in"]),
  pickupTime: z.enum([
    "As soon as possible",
    "In 30 minutes",
    "In 1 hour",
    "Schedule at counter",
  ]),
  notes: z.string().trim().max(500).optional(),
  language: z.enum(["en", "fr", "ar"]),
  items: z.array(cartItemSchema).min(1).max(30),
  subtotal: z.number().nonnegative().max(10000),
  total: z.number().nonnegative().max(10000),
}).strict()

function makeOrderCode() {
  return `ESA-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
}

export async function POST(request: Request) {
  try {
    const parsed = orderSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your order information.", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const order = parsed.data
    const pricedOrder = priceOrderItems(order.items)

    if (
      Math.abs(pricedOrder.subtotal - order.subtotal) > 0.01 ||
      Math.abs(pricedOrder.subtotal - order.total) > 0.01
    ) {
      return NextResponse.json(
        { error: "Menu pricing changed. Please review your cart and try again." },
        { status: 409 },
      )
    }

    const config = getSupabaseServerConfig()
    if (!config) {
      return NextResponse.json(
        { error: "Ordering is not connected yet. Please try again shortly." },
        { status: 503 },
      )
    }

    const orderCode = makeOrderCode()
    const { data, error } = await config.client.rpc("submit_order", {
      p_backend_secret: config.backendSecret,
      p_order_code: orderCode,
      p_customer_name: order.customerName,
      p_phone: order.phone,
      p_fulfillment: order.fulfillment,
      p_pickup_time: order.pickupTime,
      p_notes: order.notes ?? null,
      p_language: order.language,
      p_items: pricedOrder.items.map((item) => ({
        product_id: item.productId,
        name: item.name,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        nutrition: item.nutrition,
        selections: item.selections,
      })),
    })

    if (error || !data) {
      console.error("order_insert_failed", error)
      return NextResponse.json({ error: "We could not place your order." }, { status: 500 })
    }

    const result = data as {
      order_code: string
      status: string
      created_at: string
    }

    return NextResponse.json({
      orderCode: result.order_code,
      status: result.status,
      createdAt: result.created_at,
    })
  } catch (error) {
    if (error instanceof OrderPricingError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("order_request_failed", error)
    return NextResponse.json({ error: "Invalid order request." }, { status: 400 })
  }
}
