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
import { useMemo, useState } from "react"
import {
  builderDefaults,
  builderGroups,
  categories,
  goals,
  products,
  type Nutrition,
  type Product,
} from "@/lib/catalog"
import type { CartItem, OrderPayload } from "@/lib/types"

type Language = "en" | "fr" | "ar"
type View = "home" | "menu" | "build" | "track"

const copy = {
  en: {
    menu: "Menu",
    build: "Build",
    track: "Orders",
    heroEyebrow: "Protein coffee · functional drinks · Kenitra",
    heroTitle: "Your drink. Your goals. Your force.",
    heroText: "Order a signature recipe or build every detail while calories, protein and price update live.",
    orderNow: "Explore the menu",
    buildMine: "Build my drink",
    popular: "Power picks",
    popularText: "Customer favourites made for energy, recovery and everyday strength.",
    allMenu: "Full menu",
    search: "Search coffee, fruit, protein…",
    customize: "Customize",
    add: "Add",
    cart: "Your order",
    checkout: "Checkout",
    emptyCart: "Your bag is ready for something powerful.",
    builderTitle: "Build your force",
    builderText: "Choose one option in every step. All nutrition values are estimates until final shop products are verified.",
    liveFuel: "Live fuel",
    trackTitle: "Track an order",
    trackText: "Enter the code from your confirmation.",
  },
  fr: {
    menu: "Menu",
    build: "Composer",
    track: "Commandes",
    heroEyebrow: "Café protéiné · boissons fonctionnelles · Kénitra",
    heroTitle: "Votre boisson. Vos objectifs. Votre force.",
    heroText: "Choisissez une recette ou composez-la pendant que calories, protéines et prix s’actualisent.",
    orderNow: "Voir le menu",
    buildMine: "Composer ma boisson",
    popular: "Les favoris",
    popularText: "Des recettes pensées pour l’énergie, la récupération et la force au quotidien.",
    allMenu: "Menu complet",
    search: "Rechercher café, fruit, protéine…",
    customize: "Personnaliser",
    add: "Ajouter",
    cart: "Votre commande",
    checkout: "Commander",
    emptyCart: "Votre panier attend une dose de force.",
    builderTitle: "Composez votre force",
    builderText: "Choisissez une option à chaque étape. Les valeurs sont estimées jusqu’à vérification des produits.",
    liveFuel: "Nutrition",
    trackTitle: "Suivre une commande",
    trackText: "Entrez le code de votre confirmation.",
  },
  ar: {
    menu: "القائمة",
    build: "حضّر مشروبك",
    track: "الطلبات",
    heroEyebrow: "قهوة بالبروتين · مشروبات وظيفية · القنيطرة",
    heroTitle: "مشروبك. هدفك. قوتك.",
    heroText: "اختر وصفة جاهزة أو حضّر مشروبك وشاهد السعر والسعرات والبروتين تتغيّر مباشرة.",
    orderNow: "اكتشف القائمة",
    buildMine: "حضّر مشروبي",
    popular: "الأكثر طلباً",
    popularText: "وصفات للطاقة، الاسترجاع والقوة اليومية.",
    allMenu: "القائمة الكاملة",
    search: "ابحث عن قهوة، فواكه، بروتين…",
    customize: "تعديل",
    add: "إضافة",
    cart: "طلبك",
    checkout: "إتمام الطلب",
    emptyCart: "السلة جاهزة لمشروب قوي.",
    builderTitle: "حضّر قوتك",
    builderText: "اختر من كل مرحلة. القيم الغذائية تقديرية إلى حين اعتماد المنتجات النهائية.",
    liveFuel: "القيم المباشرة",
    trackTitle: "تتبع الطلب",
    trackText: "أدخل الرمز الموجود في تأكيد الطلب.",
  },
} as const

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
  return (
    <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <span className="brand-mark"><b>F</b><i>P</i></span>
      {!compact && (
        <span className="brand-copy">
          <strong>ESAFORCE</strong>
          <small>FUEL YOUR STRENGTH</small>
        </span>
      )}
    </button>
  )
}

function NutritionRow({ nutrition, small = false }: { nutrition: Nutrition; small?: boolean }) {
  const items = [
    ["kcal", Math.round(nutrition.kcal)],
    ["protein", `${round(nutrition.protein)}g`],
    ["sugar", `${round(nutrition.sugar)}g`],
    ["caffeine", `${Math.round(nutrition.caffeine)}mg`],
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
  favorite,
  onFavorite,
  onAdd,
}: {
  product: Product
  favorite: boolean
  onFavorite: () => void
  onAdd: () => void
}) {
  return (
    <article className="product-card" style={{ "--accent": product.accent } as React.CSSProperties}>
      <div className="product-photo">
        <Image
          src="/brand/drinks-hero.png"
          alt=""
          fill
          sizes="(max-width: 700px) 72vw, 320px"
          style={{ objectPosition: `${product.imagePosition} 62%` }}
        />
        <span className="product-tint" />
        {product.popular && <span className="product-badge"><Zap size={12} /> Popular</span>}
        {product.vegan && <span className="vegan-badge">V</span>}
        <button className={favorite ? "heart active" : "heart"} onClick={onFavorite} aria-label="Favourite">
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-body">
        <span className="category-label">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <NutritionRow nutrition={product.nutrition} small />
        <div className="product-footer">
          <strong>{product.price} <small>MAD</small></strong>
          <button onClick={onAdd} aria-label={`Add ${product.name}`}><span>Add</span><ArrowRight size={16} /></button>
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
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    const stored = window.localStorage.getItem("esaforce-favorites")
    return stored ? JSON.parse(stored) : []
  })
  const [category, setCategory] = useState("All")
  const [goal, setGoal] = useState("All goals")
  const [query, setQuery] = useState("")
  const [builder, setBuilder] = useState(builderDefaults)
  const [toast, setToast] = useState("")
  const t = copy[language]
  const rtl = language === "ar"

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const filteredProducts = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    return products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category
      const matchesGoal = goal === "All goals" || product.goal === goal
      const matchesQuery = !normalized || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(normalized)
      return matchesCategory && matchesGoal && matchesQuery
    })
  }, [category, goal, query])

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

  function addProduct(product: Product) {
    const existing = cart.find((item) => item.productId === product.id && !item.selections)
    if (existing) {
      setCart(cart.map((item) => item.lineId === existing.lineId ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      setCart([...cart, { lineId: crypto.randomUUID(), productId: product.id, name: product.name, price: product.price, quantity: 1, nutrition: product.nutrition }])
    }
    notify(`${product.name} added`)
  }

  function addCustomDrink() {
    const selections = { ...builder }
    setCart([...cart, {
      lineId: crypto.randomUUID(),
      productId: "custom-drink",
      name: "My ESAFORCE Mix",
      price: builderResult.price,
      quantity: 1,
      nutrition: builderResult.nutrition,
      selections,
    }])
    notify("Custom drink added")
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
          <div className="language-picker">
            <Languages size={17} />
            <select value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label="Language">
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="ar">AR</option>
            </select>
            <ChevronDown size={13} />
          </div>
          <button className="cart-button" onClick={() => setCartOpen(true)} aria-label="Open cart">
            <ShoppingBag size={19} />
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
        </div>
      </header>

      <main>
        {view === "home" && (
          <>
            <section className="hero">
              <Image src="/brand/drinks-hero.png" alt="ESAFORCE fresh protein drinks" fill priority sizes="100vw" />
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
                  <span><b>24</b> recipes</span>
                  <span><b>50+</b> choices</span>
                  <span><b>Live</b> nutrition</span>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="section-heading">
                <div><span>01 · SIGNATURES</span><h2>{t.popular}</h2><p>{t.popularText}</p></div>
                <button className="text-button" onClick={() => navigate("menu")}>{t.allMenu}<ArrowRight size={16} /></button>
              </div>
              <div className="product-grid featured">
                {products.filter((product) => product.popular).slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} onAdd={() => addProduct(product)} />
                ))}
              </div>
            </section>

            <section className="builder-promo">
              <Image src="/brand/ingredients-flatlay.png" alt="Fresh ESAFORCE ingredients" fill sizes="100vw" />
              <div className="builder-promo-overlay" />
              <div>
                <span className="eyebrow"><Zap size={14} /> LIVE CALCULATOR</span>
                <h2>Every choice. Counted live.</h2>
                <p>Pick your milk, coffee, protein, fruit, flavour and booster. See exactly how your mix changes.</p>
                <button className="primary-button" onClick={() => navigate("build")}>Start building<ArrowRight size={18} /></button>
              </div>
              <div className="macro-demo">
                <span><small>Calories</small><b>328</b><em>kcal</em></span>
                <span><small>Protein</small><b>31</b><em>g</em></span>
                <span><small>Price</small><b>46</b><em>MAD</em></span>
              </div>
            </section>

            <section className="shop-story">
              <div className="shop-copy">
                <span className="section-kicker">COMING TO KENITRA</span>
                <h2>Built for quick fuel. Designed to stay.</h2>
                <p>A compact protein coffee bar with app ordering, fresh preparation and a simple pickup flow.</p>
                <div className="story-features">
                  <span><Coffee />Fresh coffee</span>
                  <span><Dumbbell />Goal-based drinks</span>
                  <span><Timer />Fast pickup</span>
                </div>
              </div>
              <div className="shop-image"><Image src="/brand/shop-interior.png" alt="ESAFORCE coffee shop interior concept" fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
            </section>
          </>
        )}

        {view === "menu" && (
          <section className="section menu-page">
            <div className="page-heading">
              <span className="section-kicker">24 RECIPES · KENITRA</span>
              <h1>{t.allMenu}</h1>
              <p>Protein coffee, shakes, smoothies, functional drinks and healthy food.</p>
            </div>
            <div className="filter-panel">
              <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} /></label>
              <select value={goal} onChange={(event) => setGoal(event.target.value)}>
                {goals.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="category-scroll">
              {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
            </div>
            <div className="results-line"><span>{filteredProducts.length} items</span><button onClick={() => { setCategory("All"); setGoal("All goals"); setQuery("") }}>Reset filters</button></div>
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} onAdd={() => addProduct(product)} />
              ))}
            </div>
          </section>
        )}

        {view === "build" && (
          <section className="builder-page">
            <div className="builder-intro">
              <span className="section-kicker">50+ COMBINATIONS · LIVE TOTALS</span>
              <h1>{t.builderTitle}</h1>
              <p>{t.builderText}</p>
            </div>
            <div className="builder-layout">
              <div className="builder-steps">
                {Object.entries(builderGroups).map(([group, options], index) => (
                  <section className="builder-step" key={group}>
                    <div className="step-heading"><span>{String(index + 1).padStart(2, "0")}</span><h2>{group === "boost" ? "Booster" : group}</h2><em>Choose one</em></div>
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
                            <span className="option-copy"><b>{option.name}</b><small>{option.price ? `+${option.price} MAD` : "Included"}</small></span>
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
                <h2>My ESAFORCE Mix</h2>
                <div className="drink-visual">
                  <span className="cup">
                    <span className="liquid" style={{ background: builderGroups.fruit.find((item) => item.id === builder.fruit)?.accent }} />
                    <b>F<span>P</span></b>
                  </span>
                  <small>{builderGroups.size.find((item) => item.id === builder.size)?.name}</small>
                </div>
                <NutritionRow nutrition={builderResult.nutrition} />
                <div className="secondary-macros">
                  <span>Carbs <b>{round(builderResult.nutrition.carbs)}g</b></span>
                  <span>Fat <b>{round(builderResult.nutrition.fat)}g</b></span>
                </div>
                {builderResult.allergens.length > 0 && <p className="allergen">Contains: {builderResult.allergens.join(", ")}</p>}
                {builderResult.nutrition.caffeine > 200 && <p className="warning">High caffeine selection</p>}
                <div className="live-total"><span>Total</span><strong>{builderResult.price} <small>MAD</small></strong></div>
                <button className="primary-button full" onClick={addCustomDrink}><ShoppingBag size={18} />Add custom drink</button>
                <p className="estimate-note">Nutritional values are estimates and vary by final product brand and preparation.</p>
              </aside>
            </div>
          </section>
        )}

        {view === "track" && <OrderTracker title={t.trackTitle} text={t.trackText} />}
      </main>

      <nav className="mobile-nav">
        <button className={view === "home" ? "active" : ""} onClick={() => navigate("home")}><Brand compact /><small>Home</small></button>
        <button className={view === "menu" ? "active" : ""} onClick={() => navigate("menu")}><Coffee /><small>{t.menu}</small></button>
        <button className={view === "build" ? "build-nav active" : "build-nav"} onClick={() => navigate("build")}><Dumbbell /><small>{t.build}</small></button>
        <button className={view === "track" ? "active" : ""} onClick={() => navigate("track")}><Timer /><small>{t.track}</small></button>
        <button onClick={() => setCartOpen(true)}><ShoppingBag />{cartCount > 0 && <i>{cartCount}</i>}<small>Cart</small></button>
      </nav>

      {cartOpen && (
        <div className="modal-layer" onMouseDown={(event) => event.currentTarget === event.target && setCartOpen(false)}>
          <aside className="cart-drawer">
            <div className="drawer-heading"><div><span>ESAFORCE</span><h2>{t.cart}</h2></div><button onClick={() => setCartOpen(false)}><X /></button></div>
            {cart.length === 0 ? (
              <div className="empty-cart"><ShoppingBag /><h3>{t.emptyCart}</h3><button className="primary-button" onClick={() => { setCartOpen(false); navigate("menu") }}>{t.orderNow}</button></div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <article className="cart-item" key={item.lineId}>
                      <div className="cart-icon"><Coffee /></div>
                      <div><h3>{item.name}</h3><p>{Math.round(item.nutrition.kcal)} kcal · {round(item.nutrition.protein)}g protein</p>{item.selections && <small>Custom recipe · {Object.keys(item.selections).length} choices</small>}</div>
                      <div className="quantity"><button onClick={() => updateQuantity(item.lineId, -1)}><Minus /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.lineId, 1)}>+</button></div>
                      <strong>{item.price * item.quantity} MAD</strong>
                    </article>
                  ))}
                </div>
                <div className="cart-summary">
                  <span>Subtotal <b>{subtotal} MAD</b></span>
                  <span>Pickup <b>Free</b></span>
                  <div>Total <strong>{subtotal} MAD</strong></div>
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
            notify(`Order ${orderCode} received`)
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
      items: items.map(({ productId, quantity, selections }) => ({
        productId,
        quantity,
        selections,
      })),
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
      if (!response.ok) throw new Error(result.error ?? "Order failed")
      onSuccess(result.orderCode)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Order failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-layer checkout-layer">
      <form className="checkout-modal" onSubmit={submit}>
        <div className="drawer-heading"><div><span>SECURE ORDER</span><h2>Checkout</h2></div><button type="button" onClick={onClose}><X /></button></div>
        <label>Name<input required minLength={2} value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} placeholder="Your name" /></label>
        <label>Phone / WhatsApp<input required minLength={8} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+212 6…" inputMode="tel" /></label>
        <fieldset><legend>Order type</legend><div className="choice-row"><button type="button" className={form.fulfillment === "pickup" ? "selected" : ""} onClick={() => setForm({ ...form, fulfillment: "pickup" })}>Takeaway</button><button type="button" className={form.fulfillment === "eat-in" ? "selected" : ""} onClick={() => setForm({ ...form, fulfillment: "eat-in" })}>Eat in</button></div></fieldset>
        <label>Ready time<select value={form.pickupTime} onChange={(event) => setForm({ ...form, pickupTime: event.target.value })}><option>As soon as possible</option><option>In 30 minutes</option><option>In 1 hour</option><option>Schedule at counter</option></select></label>
        <label>Notes<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Allergy or preparation note…" rows={3} /></label>
        <p className="checkout-notice">Payment: cash or card at the counter. Please tell staff about serious allergies.</p>
        {error && <p className="form-error">{error}</p>}
        <div className="checkout-total"><span>{items.length} items</span><strong>{total} MAD</strong></div>
        <button className="primary-button full" disabled={loading}>{loading ? "Placing order…" : "Confirm order"}<ArrowRight size={18} /></button>
      </form>
    </div>
  )
}

function OrderTracker({ title, text }: { title: string; text: string }) {
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
      if (!response.ok) throw new Error(result.error ?? "Order not found")
      setOrder(result)
    } catch (requestError) {
      setOrder(null)
      setError(requestError instanceof Error ? requestError.message : "Order not found")
    } finally {
      setLoading(false)
    }
  }

  const activeIndex = order ? statusSteps.indexOf(String(order.status)) : -1

  return (
    <section className="tracker-page">
      <div className="tracker-card">
        <span className="section-kicker">LIVE ORDER STATUS</span>
        <h1>{title}</h1>
        <p>{text}</p>
        <form onSubmit={track}><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="ESA-ABC123" required /><button className="primary-button" disabled={loading}>{loading ? "Checking…" : "Track"}</button></form>
        {error && <p className="form-error">{error}</p>}
        {order && (
          <div className="tracking-result">
            <div className="order-code"><span>Order</span><strong>{order.order_code}</strong><b>{order.total} MAD</b></div>
            <div className="status-track">
              {statusSteps.map((status, index) => <span key={status} className={index <= activeIndex ? "done" : ""}><i>{index < activeIndex ? <Check /> : index + 1}</i><b>{status}</b></span>)}
            </div>
            <p>Ready time: <b>{order.pickup_time}</b></p>
          </div>
        )}
      </div>
      <div className="tracker-image"><Image src="/brand/shop-exterior.png" alt="ESAFORCE Kenitra exterior concept" fill sizes="50vw" /></div>
    </section>
  )
}
