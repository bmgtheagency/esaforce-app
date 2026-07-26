"use client"

import { Check, Clock3, Coffee, Languages, LockKeyhole, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import {
  catalogText,
  fulfillmentText,
  languages,
  pickupTimeText,
  statusText,
  ui,
  type Language,
} from "@/lib/i18n"

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
  const [language, setLanguage] = useState<Language>("en")
  const [pin, setPin] = useState("")
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [opened, setOpened] = useState(false)
  const t = ui[language]

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
    window.localStorage.setItem("esaforce-language", language)
  }, [language])

  async function loadOrders() {
    if (!pin) return
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/admin/orders", { headers: { "x-admin-pin": pin } })
      const result = await response.json()
      if (!response.ok) throw new Error("load_failed")
      setOrders(result)
      setOpened(true)
      window.sessionStorage.setItem("esaforce-admin-pin", pin)
    } catch {
      setError(t.adminLoadError)
      setOpened(false)
    } finally {
      setLoading(false)
    }
  }

  async function changeStatus(orderCode: string, status: string) {
    setError("")
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify({ orderCode, status }),
      })
      if (!response.ok) throw new Error("update_failed")
      setOrders(orders.map((order) => order.order_code === orderCode ? { ...order, status } : order))
    } catch {
      setError(t.adminUpdateError)
    }
  }

  const locale = language === "ar" ? "ar-MA" : language === "fr" ? "fr-MA" : "en-GB"

  return (
    <main className="admin-page" dir={language === "ar" ? "rtl" : "ltr"}>
      <header>
        <div><span className="brand-mark"><b>F</b><i>P</i></span><strong>ESAFORCE</strong><small>{t.kitchen}</small></div>
        <div className="admin-header-actions">
          <label className="admin-language"><Languages size={16} /><select value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label={t.language}>{languages.map((item) => <option key={item.code} value={item.code}>{item.label} · {item.native}</option>)}</select></label>
          <button onClick={loadOrders}><RefreshCw size={17} />{t.refresh}</button>
        </div>
      </header>
      <section className="admin-login">
        <label><LockKeyhole size={18} /><input type="password" value={pin} onChange={(event) => setPin(event.target.value)} placeholder={t.adminPin} /><button onClick={loadOrders}>{loading ? t.loading : t.openDashboard}</button></label>
        {error && <p>{error}</p>}
      </section>
      {opened && orders.length === 0 && <p className="admin-empty">{t.noOrders}</p>}
      <section className="admin-grid">
        {orders.map((order) => (
          <article className={`admin-order status-${order.status}`} key={order.id}>
            <div className="admin-order-heading">
              <div><span>{order.order_code}</span><h2>{order.customer_name}</h2><p>{fulfillmentText(order.fulfillment, language)} · {pickupTimeText(order.pickup_time, language)}</p></div>
              <strong>{order.total} MAD</strong>
            </div>
            <div className="admin-items">
              {order.order_items.map((item) => (
                <div key={item.id}>
                  <b>{item.quantity}×</b>
                  <span>{catalogText(item.name, language)}</span>
                  {Object.keys(item.selections ?? {}).length > 0 && <small>{Object.values(item.selections).map((value) => catalogText(value, language)).join(" · ")}</small>}
                </div>
              ))}
            </div>
            {order.notes && <p className="admin-note">{order.notes}</p>}
            <div className="admin-meta"><span><Clock3 />{new Date(order.created_at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</span><span><Coffee />{order.phone}</span></div>
            <div className="status-actions">{statuses.map((status) => <button key={status} className={order.status === status ? "active" : ""} onClick={() => changeStatus(order.order_code, status)}>{order.status === status && <Check size={13} />}{statusText(status, language)}</button>)}</div>
          </article>
        ))}
      </section>
    </main>
  )
}
