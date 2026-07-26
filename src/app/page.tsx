"use client"

import Image from "next/image"
import {
  ArrowRight,
  Check,
  ChevronDown,
  Coffee,
  Dumbbell,
  Heart,
  Languages,
  Minus,
  Search,
  ShoppingBag,
  Sparkles,
  Timer,
  X,
  Zap,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  builderDefaults,
  builderGroups,
  categories,
  goals,
  products,
  type Nutrition,
  type Product,
} from "@/lib/catalog"
import {
  catalogText,
  languages,
  pickupTimes,
  pickupTimeText,
  statusText,
  ui,
  type Language,
  type UiCopy,
} from "@/lib/i18n"
import type { CartItem, OrderPayload } from "@/lib/types"

type View = "home" | "menu" | "build" | "track"

const statusSteps = ["received", "preparing", "ready", "collected"]

function addNutrition(a: Nutrition, b: Nutrition): Nutrition {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    sugar: a.sugar + b.sugar,
    fat: a.fat + b.fat,
    caffeine: a.caffeine + b.caffeine,
  }
}

function round(value: number) {
  return Math.round(value * 10) / 10
}

function Brand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return <span className="brand-mark" aria-hidden="true"><b>F</b><i>P</i></span>
  }

  return (
    <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <span className="brand-mark"><b>F</b><i>P</i></span>
      <span className="brand-copy">
        <strong>ESAFORCE</strong>
        <small>FUEL YOUR STRENGTH</small>
      </span>
    </button>
  )
}

function LanguagePicker({
  language,
  onChange,
}: {
  language: Language
  onChange: (language: Language) => void
}) {
  return (
    <div className="language-picker">
      <Languages size={17} />
      <select
        value={language}
        onChange={(event) => onChange(event.target.value as Language)}
        aria-label={ui[language].language}
      >
        {languages.map((item) => <option key={item.code} value={item.code}>{item.label} · {item.native}</option>)}
      </select>
      <ChevronDown size={13} />
    </div>
  )
}

function NutritionRow({
  nutrition,
  t,
  small = false,
}: {
  nutrition: Nutrition
  t: UiCopy
  small?: boolean
}) {
  const items = [
    [t.calories, Math.round(nutrition.kcal)],
    [t.protein, `${round(nutrition.protein)}g`],
    [t.sugar, `${round(nutrition.sugar)}g`],
    [t.caffeine, `${Math.round(nutrition.caffeine)}mg`],
  ]
  return (
    <div className={small ? "nutrition-row small" : "nutrition-row"}>
      {items.map(([label, value]) => (
        <span key={label}>
          <b>{value}</b>
          <small>{label}</small>
        </span>
      ))}
    </div>
  )
}

function ProductCard({
  product,
  language,
  t,
  favorite,
  onFavorite,
  onAdd,
}: {
  product: Product
  language: Language
  t: UiCopy
  favorite: boolean
  onFavorite: () => void
  onAdd: () => void
}) {
  const name = catalogText(product.name, language)
  return (
    <article className="product-card" style={{ "--accent": product.accent } as React.CSSProperties}>
      <div className="product-photo">
        <Image
          src="/brand/drinks-hero.webp"
          alt={name}
          fill
          sizes="(max-width: 700px) 72vw, 320px"
          style={{ objectPosition: `${product.imagePosition} 62%` }}
        />
        <span className="product-tint" />
        {product.popular && <span className="product-badge"><Zap size={12} /> {t.popularBadge}</span>}
        {product.vegan && <span className="vegan-badge" title={t.veganBadge}>V</span>}
        <button className={favorite ? "heart active" : "heart"} onClick={onFavorite} aria-label={`${t.favourite}: ${name}`}>
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-body">
        <span className="category-label">{catalogText(product.category, language)}</span>
        <h3>{name}</h3>
        <p>{catalogText(product.description, language)}</p>
        <NutritionRow nutrition={product.nutrition} t={t} small />
        <div className="product-footer">
          <strong>{product.price} <small>MAD</small></strong>
          <button onClick={onAdd} aria-label={`${t.add}: ${name}`}><span>{t.add}</span><ArrowRight size={16} /></button>
        </div>
      </div>
    </article>
  )
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en")
  const [view, setView] = useState<View>("home")
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [category, setCategory] = useState("All")
  const [goal, setGoal] = useState("All goals")
  const [query, setQuery] = useState("")
  const [builder, setBuilder] = useState(builderDefaults)
  const [toast, setToast] = useState("")
  const t = ui[language]
  const rtl = language === "ar"

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = rtl ? "rtl" : "ltr"
    window.localStorage.setItem("esaforce-language", language)
  }, [language, rtl])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const filteredProducts = useMemo(() => {
    const normalized = query.toLocaleLowerCase(language).trim()
    return products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category
      const matchesGoal = goal === "All goals" || product.goal === goal
      const searchable = [
        product.name,
        product.description,
        product.category,
        catalogText(product.name, language),
        catalogText(product.description, language),
        catalogText(product.category, language),
      ].join(" ").toLocaleLowerCase(language)
      return matchesCategory && matchesGoal && (!normalized || searchable.includes(normalized))
    })
  }, [category, goal, language, query])

  const builderResult = useMemo(() => {
    let price = 14
    let nutrition: Nutrition = { kcal: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, caffeine: 0 }
    const allergens = new Set<string>()

    Object.entries(builder).forEach(([group, id]) => {
      const option = builderGroups[group].find((item) => item.id === id)
      if (!option) return
      price += option.price
      nutrition = addNutrition(nutrition, option.nutrition)
      if (option.allergen) allergens.add(option.allergen)
    })

    const sizeMultiplier = builder.size === "small" ? 0.8 : builder.size === "large" ? 1.25 : 1
    nutrition = Object.fromEntries(
      Object.entries(nutrition).map(([key, value]) => [key, value * sizeMultiplier]),
    ) as Nutrition

    return { price, nutrition, allergens: Array.from(allergens) }
  }, [builder])

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(""), 2200)
  }

  function changeLanguage(next: Language) {
    setLanguage(next)
  }

  function addProduct(product: Product) {
    const existing = cart.find((item) => item.productId === product.id && !item.selections)
    if (existing) {
      setCart(cart.map((item) => item.lineId === existing.lineId ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      setCart([...cart, { lineId: crypto.randomUUID(), productId: product.id, name: product.name, price: product.price, quantity: 1, nutrition: product.nutrition }])
    }
    notify(`${catalogText(product.name, language)} ${t.added}`)
  }

  function addCustomDrink() {
    setCart([...cart, {
      lineId: crypto.randomUUID(),
      productId: "custom-drink",
      name: "My ESAFORCE Mix",
      price: builderResult.price,
      quantity: 1,
      nutrition: builderResult.nutrition,
      selections: { ...builder },
    }])
    notify(t.customAdded)
    setCartOpen(true)
  }

  function updateQuantity(lineId: string, change: number) {
    setCart(cart.flatMap((item) => {
      if (item.lineId !== lineId) return [item]
      const quantity = item.quantity + change
      return quantity > 0 ? [{ ...item, quantity }] : []
    }))
  }

  function toggleFavorite(id: string) {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id]
    setFavorites(next)
    window.localStorage.setItem("esaforce-favorites", JSON.stringify(next))
  }

  function navigate(next: View) {
    setView(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const productCard = (product: Product) => (
    <ProductCard
      key={product.id}
      product={product}
      language={language}
      t={t}
      favorite={favorites.includes(product.id)}
      onFavorite={() => toggleFavorite(product.id)}
      onAdd={() => addProduct(product)}
    />
  )

  return (
    <div className="app-shell" dir={rtl ? "rtl" : "ltr"}>
      <header className="site-header">
        <Brand />
        <nav>
          <button className={view === "menu" ? "active" : ""} onClick={() => navigate("menu")}>{t.menu}</button>
          <button className={view === "build" ? "active" : ""} onClick={() => navigate("build")}>{t.build}</button>
          <button className={view === "track" ? "active" : ""} onClick={() => navigate("track")}>{t.track}</button>
        </nav>
        <div className="header-actions">
          <LanguagePicker language={language} onChange={changeLanguage} />
          <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={t.openCart}>
            <ShoppingBag size={19} />
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
        </div>
      </header>

      <main>
        {view === "home" && (
          <>
            <section className="hero">
              <Image src="/brand/drinks-hero.webp" alt={t.heroEyebrow} fill priority sizes="100vw" />
              <div className="hero-overlay" />
              <div className="hero-content">
                <span className="eyebrow"><Sparkles size={15} /> {t.heroEyebrow}</span>
                <h1>{t.heroTitle}</h1>
                <p>{t.heroText}</p>
                <div className="hero-buttons">
                  <button className="primary-button" onClick={() => navigate("menu")}>{t.orderNow}<ArrowRight size={18} /></button>
                  <button className="secondary-button" onClick={() => navigate("build")}><Dumbbell size={18} />{t.buildMine}</button>
                </div>
                <div className="hero-facts">
                  <span><b>24</b> {t.recipes}</span>
                  <span><b>50+</b> {t.choices}</span>
                  <span><b>{t.live}</b> {t.nutrition}</span>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="section-heading">
                <div><span>01 · {t.signatures}</span><h2>{t.popular}</h2><p>{t.popularText}</p></div>
                <button className="text-button" onClick={() => navigate("menu")}>{t.allMenu}<ArrowRight size={16} /></button>
              </div>
              <div className="product-grid featured">
                {products.filter((product) => product.popular).slice(0, 4).map(productCard)}
              </div>
            </section>

            <section className="builder-promo">
              <Image src="/brand/ingredients-flatlay.webp" alt={t.calculatorText} fill sizes="100vw" />
              <div className="builder-promo-overlay" />
              <div>
                <span className="eyebrow"><Zap size={14} /> {t.calculator}</span>
                <h2>{t.calculatorTitle}</h2>
                <p>{t.calculatorText}</p>
                <button className="primary-button" onClick={() => navigate("build")}>{t.startBuilding}<ArrowRight size={18} /></button>
              </div>
              <div className="macro-demo">
                <span><small>{t.calories}</small><b>328</b><em>kcal</em></span>
                <span><small>{t.protein}</small><b>31</b><em>g</em></span>
                <span><small>{t.price}</small><b>46</b><em>MAD</em></span>
              </div>
            </section>

            <section className="shop-story">
              <div className="shop-copy">
                <span className="section-kicker">{t.coming}</span>
                <h2>{t.storyTitle}</h2>
                <p>{t.storyText}</p>
                <div className="story-features">
                  <span><Coffee />{t.freshCoffee}</span>
                  <span><Dumbbell />{t.goalDrinks}</span>
                  <span><Timer />{t.fastPickup}</span>
                </div>
              </div>
              <div className="shop-image"><Image src="/brand/shop-interior.webp" alt={t.storyTitle} fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
            </section>
          </>
        )}

        {view === "menu" && (
          <section className="section menu-page">
            <div className="page-heading">
              <span className="section-kicker">{t.menuKicker}</span>
              <h1>{t.allMenu}</h1>
              <p>{t.menuDescription}</p>
            </div>
            <div className="filter-panel">
              <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} /></label>
              <select value={goal} onChange={(event) => setGoal(event.target.value)} aria-label={catalogText("All goals", language)}>
                {goals.map((item) => <option key={item} value={item}>{catalogText(item, language)}</option>)}
              </select>
            </div>
            <div className="category-scroll">
              {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{catalogText(item, language)}</button>)}
            </div>
            <div className="results-line"><span>{filteredProducts.length} {t.items}</span><button onClick={() => { setCategory("All"); setGoal("All goals"); setQuery("") }}>{t.resetFilters}</button></div>
            <div className="product-grid">{filteredProducts.map(productCard)}</div>
          </section>
        )}

        {view === "build" && (
          <section className="builder-page">
            <div className="builder-intro">
              <span className="section-kicker">{t.builderKicker}</span>
              <h1>{t.builderTitle}</h1>
              <p>{t.builderText}</p>
            </div>
            <div className="builder-layout">
              <div className="builder-steps">
                {Object.entries(builderGroups).map(([group, options], index) => (
                  <section className="builder-step" key={group}>
                    <div className="step-heading"><span>{String(index + 1).padStart(2, "0")}</span><h2>{catalogText(group, language)}</h2><em>{t.chooseOne}</em></div>
                    <div className={`option-grid ${group === "fruit" ? "fruit-options" : ""}`}>
                      {options.map((option) => {
                        const selected = builder[group] === option.id
                        return (
                          <button
                            key={option.id}
                            className={selected ? "builder-option selected" : "builder-option"}
                            onClick={() => setBuilder({ ...builder, [group]: option.id })}
                            style={{ "--option": option.accent ?? "#e31525" } as React.CSSProperties}
                          >
                            {group === "fruit" && <span className={`fruit-thumb fruit-${option.id}`} />}
                            <span className="option-dot" />
                            <span className="option-copy"><b>{catalogText(option.name, language)}</b><small>{option.price ? `+${option.price} MAD` : t.included}</small></span>
                            {selected && <Check size={17} />}
                          </button>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
              <aside className="live-card">
                <span className="live-label"><span /> {t.liveFuel}</span>
                <h2>{t.customMix}</h2>
                <div className="drink-visual">
                  <span className="cup">
                    <span className="liquid" style={{ background: builderGroups.fruit.find((item) => item.id === builder.fruit)?.accent }} />
                    <b>F<span>P</span></b>
                  </span>
                  <small>{catalogText(builderGroups.size.find((item) => item.id === builder.size)?.name ?? "", language)}</small>
                </div>
                <NutritionRow nutrition={builderResult.nutrition} t={t} />
                <div className="secondary-macros">
                  <span>{t.carbs} <b>{round(builderResult.nutrition.carbs)}g</b></span>
                  <span>{t.fat} <b>{round(builderResult.nutrition.fat)}g</b></span>
                </div>
                {builderResult.allergens.length > 0 && <p className="allergen">{t.contains}: {builderResult.allergens.map((item) => catalogText(item, language)).join("، ")}</p>}
                {builderResult.nutrition.caffeine > 200 && <p className="warning">{t.highCaffeine}</p>}
                <div className="live-total"><span>{t.total}</span><strong>{builderResult.price} <small>MAD</small></strong></div>
                <button className="primary-button full" onClick={addCustomDrink}><ShoppingBag size={18} />{t.addCustom}</button>
                <p className="estimate-note">{t.estimate}</p>
              </aside>
            </div>
          </section>
        )}

        {view === "track" && <OrderTracker language={language} />}
      </main>

      <nav className="mobile-nav">
        <button className={view === "home" ? "active" : ""} onClick={() => navigate("home")}><Brand compact /><small>{t.home}</small></button>
        <button className={view === "menu" ? "active" : ""} onClick={() => navigate("menu")}><Coffee /><small>{t.menu}</small></button>
        <button className={view === "build" ? "build-nav active" : "build-nav"} onClick={() => navigate("build")}><Dumbbell /><small>{t.build}</small></button>
        <button className={view === "track" ? "active" : ""} onClick={() => navigate("track")}><Timer /><small>{t.track}</small></button>
        <button onClick={() => setCartOpen(true)}><ShoppingBag />{cartCount > 0 && <i>{cartCount}</i>}<small>{t.cartNav}</small></button>
      </nav>

      {cartOpen && (
        <div className="modal-layer" onMouseDown={(event) => event.currentTarget === event.target && setCartOpen(false)}>
          <aside className="cart-drawer">
            <div className="drawer-heading"><div><span>ESAFORCE</span><h2>{t.cart}</h2></div><button onClick={() => setCartOpen(false)} aria-label={t.close}><X /></button></div>
            {cart.length === 0 ? (
              <div className="empty-cart"><ShoppingBag /><h3>{t.emptyCart}</h3><button className="primary-button" onClick={() => { setCartOpen(false); navigate("menu") }}>{t.orderNow}</button></div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <article className="cart-item" key={item.lineId}>
                      <div className="cart-icon"><Coffee /></div>
                      <div>
                        <h3>{catalogText(item.name, language)}</h3>
                        <p>{Math.round(item.nutrition.kcal)} kcal · {round(item.nutrition.protein)}g {t.protein.toLocaleLowerCase(language)}</p>
                        {item.selections && <small>{t.customRecipe} · {Object.keys(item.selections).length} {t.choices}</small>}
                      </div>
                      <div className="quantity"><button onClick={() => updateQuantity(item.lineId, -1)}><Minus /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.lineId, 1)}>+</button></div>
                      <strong>{item.price * item.quantity} MAD</strong>
                    </article>
                  ))}
                </div>
                <div className="cart-summary">
                  <span>{t.subtotal} <b>{subtotal} MAD</b></span>
                  <span>{t.pickup} <b>{t.free}</b></span>
                  <div>{t.total} <strong>{subtotal} MAD</strong></div>
                  <button className="primary-button full" onClick={() => { setCartOpen(false); setCheckoutOpen(true) }}>{t.checkout}<ArrowRight size={18} /></button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <Checkout
          language={language}
          items={cart}
          total={subtotal}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={(orderCode) => {
            setCart([])
            setCheckoutOpen(false)
            window.localStorage.setItem("esaforce-last-order", orderCode)
            navigate("track")
            notify(`${t.order} ${orderCode} ${t.orderReceived}`)
          }}
        />
      )}

      {toast && <div className="toast"><Check size={17} />{toast}</div>}
    </div>
  )
}

function Checkout({
  language,
  items,
  total,
  onClose,
  onSuccess,
}: {
  language: Language
  items: CartItem[]
  total: number
  onClose: () => void
  onSuccess: (code: string) => void
}) {
  const t = ui[language]
  const [form, setForm] = useState({ customerName: "", phone: "", fulfillment: "pickup" as "pickup" | "eat-in", pickupTime: "As soon as possible", notes: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const payload: OrderPayload = {
      ...form,
      language,
      items: items.map(({ productId, quantity, selections }) => ({ productId, quantity, selections })),
      subtotal: total,
      total,
    }
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error("order_failed")
      onSuccess(result.orderCode)
    } catch {
      setError(t.orderFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-layer checkout-layer">
      <form className="checkout-modal" onSubmit={submit} dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="drawer-heading"><div><span>{t.secureOrder}</span><h2>{t.checkout}</h2></div><button type="button" onClick={onClose} aria-label={t.close}><X /></button></div>
        <label>{t.name}<input required minLength={2} value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} placeholder={t.namePlaceholder} /></label>
        <label>{t.phone}<input required minLength={8} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+212 6…" inputMode="tel" /></label>
        <fieldset><legend>{t.orderType}</legend><div className="choice-row"><button type="button" className={form.fulfillment === "pickup" ? "selected" : ""} onClick={() => setForm({ ...form, fulfillment: "pickup" })}>{t.takeaway}</button><button type="button" className={form.fulfillment === "eat-in" ? "selected" : ""} onClick={() => setForm({ ...form, fulfillment: "eat-in" })}>{t.eatIn}</button></div></fieldset>
        <label>{t.readyTime}<select value={form.pickupTime} onChange={(event) => setForm({ ...form, pickupTime: event.target.value })}>{pickupTimes.map((item) => <option key={item.value} value={item.value}>{t[item.key]}</option>)}</select></label>
        <label>{t.notes}<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder={t.notesPlaceholder} rows={3} /></label>
        <p className="checkout-notice">{t.paymentNotice}</p>
        {error && <p className="form-error">{error}</p>}
        <div className="checkout-total"><span>{items.length} {t.items}</span><strong>{total} MAD</strong></div>
        <button className="primary-button full" disabled={loading}>{loading ? t.placingOrder : t.confirmOrder}<ArrowRight size={18} /></button>
      </form>
    </div>
  )
}

function OrderTracker({ language }: { language: Language }) {
  const t = ui[language]
  const [code, setCode] = useState(() => {
    if (typeof window === "undefined") return ""
    return window.localStorage.getItem("esaforce-last-order") ?? ""
  })
  const [order, setOrder] = useState<Record<string, string | number> | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function track(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(code.trim())}`)
      const result = await response.json()
      if (!response.ok) throw new Error("not_found")
      setOrder(result)
    } catch {
      setOrder(null)
      setError(t.orderNotFound)
    } finally {
      setLoading(false)
    }
  }

  const activeIndex = order ? statusSteps.indexOf(String(order.status)) : -1

  return (
    <section className="tracker-page">
      <div className="tracker-card">
        <span className="section-kicker">{t.trackKicker}</span>
        <h1>{t.trackTitle}</h1>
        <p>{t.trackText}</p>
        <form onSubmit={track}><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="ESA-ABC123" required /><button className="primary-button" disabled={loading}>{loading ? t.checking : t.trackAction}</button></form>
        {error && <p className="form-error">{error}</p>}
        {order && (
          <div className="tracking-result">
            <div className="order-code"><span>{t.order}</span><strong>{order.order_code}</strong><b>{order.total} MAD</b></div>
            <div className="status-track">
              {statusSteps.map((status, index) => <span key={status} className={index <= activeIndex ? "done" : ""}><i>{index < activeIndex ? <Check /> : index + 1}</i><b>{statusText(status, language)}</b></span>)}
            </div>
            {order.status === "cancelled" && <p className="form-error">{statusText("cancelled", language)}</p>}
            <p>{t.readyTime}: <b>{pickupTimeText(String(order.pickup_time), language)}</b></p>
          </div>
        )}
      </div>
      <div className="tracker-image"><Image src="/brand/shop-exterior.webp" alt={t.coming} fill sizes="50vw" /></div>
    </section>
  )
}
