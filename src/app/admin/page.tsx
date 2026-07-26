"use client"

import { Check, Clock3, Coffee, LockKeyhole, RefreshCw } from "lucide-react"
import { useState } from "react"

type AdminOrder = {
  id: string
  order_code: string
  customer_name: string
  phone: string
  fulfillment: string
  pickup_time: string
  notes: string | null
  total: number
  status: string
  created_at: string
  order_items: Array<{ id: string; name: string; quantity: number; unit_price: number; selections: Record<string, string> }>
}

const statuses = ["received", "preparing", "ready", "collected", "cancelled"]

export default function AdminPage() {
  const [pin, setPin] = useState(() => {
    if (typeof window === "undefined") return ""
    return window.sessionStorage.getItem("esaforce-admin-pin") ?? ""
  })
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function loadOrders() {
    if (!pin) return
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/admin/orders", { headers: { "x-admin-pin": pin } })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? "Could not load orders")
      setOrders(result)
      window.sessionStorage.setItem("esaforce-admin-pin", pin)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load orders")
    } finally {
      setLoading(false)
    }
  }

  async function changeStatus(orderCode: string, status: string) {
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ orderCode, status }),
    })
    if (response.ok) setOrders(orders.map((order) => order.order_code === orderCode ? { ...order, status } : order))
  }

  return (
    <main className="admin-page">
      <header><div><span className="brand-mark"><b>F</b><i>P</i></span><strong>ESAFORCE</strong><small>KITCHEN</small></div><button onClick={loadOrders}><RefreshCw size={17} />Refresh</button></header>
      <section className="admin-login">
        <label><LockKeyhole size={18} /><input type="password" value={pin} onChange={(event) => setPin(event.target.value)} placeholder="Admin PIN" /><button onClick={loadOrders}>{loading ? "Loading…" : "Open dashboard"}</button></label>
        {error && <p>{error}</p>}
      </section>
      <section className="admin-grid">
        {orders.map((order) => (
          <article className={`admin-order status-${order.status}`} key={order.id}>
            <div className="admin-order-heading"><div><span>{order.order_code}</span><h2>{order.customer_name}</h2><p>{order.fulfillment} · {order.pickup_time}</p></div><strong>{order.total} MAD</strong></div>
            <div className="admin-items">{order.order_items.map((item) => <div key={item.id}><b>{item.quantity}×</b><span>{item.name}</span>{Object.keys(item.selections ?? {}).length > 0 && <small>{Object.values(item.selections).join(" · ")}</small>}</div>)}</div>
            {order.notes && <p className="admin-note">{order.notes}</p>}
            <div className="admin-meta"><span><Clock3 />{new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span><span><Coffee />{order.phone}</span></div>
            <div className="status-actions">{statuses.map((status) => <button key={status} className={order.status === status ? "active" : ""} onClick={() => changeStatus(order.order_code, status)}>{order.status === status && <Check size={13} />}{status}</button>)}</div>
          </article>
        ))}
      </section>
    </main>
  )
}
