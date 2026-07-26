import type { Nutrition } from "@/lib/catalog"

export type CartItem = {
  lineId: string
  productId: string
  name: string
  price: number
  quantity: number
  nutrition: Nutrition
  selections?: Record<string, string>
}

export type OrderPayload = {
  customerName: string
  phone: string
  fulfillment: "pickup" | "eat-in"
  pickupTime: string
  notes?: string
  language: "en" | "fr" | "ar"
  items: Array<Pick<CartItem, "productId" | "quantity" | "selections">>
  subtotal: number
  total: number
}
