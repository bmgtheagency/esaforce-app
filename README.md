# ESAFORCE

Mobile-first ordering app for ESAFORCE Protein Coffee & Functional Drinks in Kenitra.

## Customer experience

- 24 menu products and goal/category filters
- Live custom-drink calculator with 50+ choices
- Calories, protein, carbs, sugar, fat, caffeine and price
- Cart, takeaway/eat-in checkout and order code
- Live order tracking
- English, French and Arabic interface
- Installable PWA

## Kitchen

Open `/admin`, enter the private kitchen PIN, then view orders and move them through:

`received → preparing → ready → collected`

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Apply `supabase/migrations/20260726210000_create_orders.sql` to the dedicated Supabase project and configure the three environment variables in Vercel. The browser never receives a database secret: all database access goes through validated server routes and narrowly scoped RPC functions.

Nutrition and prices are working estimates. Replace them with verified supplier labels and actual ingredient costs before commercial launch.
