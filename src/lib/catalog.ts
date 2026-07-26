export type Nutrition = {
  kcal: number
  protein: number
  carbs: number
  sugar: number
  fat: number
  caffeine: number
}

export type Product = {
  id: string
  name: string
  description: string
  category: string
  goal: string
  price: number
  nutrition: Nutrition
  accent: string
  imagePosition: string
  popular?: boolean
  vegan?: boolean
}

export type BuilderOption = {
  id: string
  name: string
  price: number
  nutrition: Nutrition
  allergen?: string
  accent?: string
}

const n = (
  kcal: number,
  protein: number,
  carbs: number,
  sugar: number,
  fat: number,
  caffeine = 0,
): Nutrition => ({ kcal, protein, carbs, sugar, fat, caffeine })

export const products: Product[] = [
  { id: "protein-iced-latte", name: "Protein Iced Latte", description: "Espresso, milk and vanilla whey over ice.", category: "Protein coffee", goal: "High protein", price: 42, nutrition: n(238, 27, 22, 16, 5, 126), accent: "#d8b38d", imagePosition: "22%", popular: true },
  { id: "protein-mocha", name: "Protein Mocha", description: "Chocolate whey, cocoa, espresso and milk.", category: "Protein coffee", goal: "High protein", price: 45, nutrition: n(296, 29, 31, 20, 7, 126), accent: "#7e402e", imagePosition: "38%", popular: true },
  { id: "salted-caramel", name: "Salted Caramel Power", description: "Double espresso, caramel and vanilla protein.", category: "Protein coffee", goal: "Energy", price: 46, nutrition: n(282, 28, 30, 21, 6, 168), accent: "#c77a36", imagePosition: "20%" },
  { id: "protein-cappuccino", name: "Protein Cappuccino", description: "Hot, airy and smooth with unflavoured whey.", category: "Hot coffee", goal: "High protein", price: 39, nutrition: n(205, 24, 18, 13, 5, 126), accent: "#c59c76", imagePosition: "17%" },
  { id: "fit-tiramisu", name: "Fit Tiramisu Coffee", description: "Coffee, cocoa, mascarpone flavour and protein.", category: "Signature", goal: "High protein", price: 48, nutrition: n(318, 30, 32, 18, 9, 126), accent: "#a66c4a", imagePosition: "36%", popular: true },
  { id: "pistachio-latte", name: "Pistachio Protein Latte", description: "Creamy pistachio, espresso and vanilla whey.", category: "Signature", goal: "Muscle gain", price: 49, nutrition: n(342, 29, 33, 21, 11, 126), accent: "#9ab671", imagePosition: "84%" },
  { id: "date-shake", name: "Moroccan Date Shake", description: "Dates, cinnamon, milk, oats and vanilla protein.", category: "Shakes", goal: "Meal replacement", price: 47, nutrition: n(397, 31, 55, 35, 8), accent: "#9a5d38", imagePosition: "54%", popular: true },
  { id: "strawberry-power", name: "Strawberry Power", description: "Strawberries, milk and vanilla whey.", category: "Shakes", goal: "Post workout", price: 45, nutrition: n(271, 28, 30, 22, 5), accent: "#ed4e62", imagePosition: "51%" },
  { id: "mango-muscle", name: "Mango Muscle", description: "Mango, yogurt and vanilla whey.", category: "Shakes", goal: "Muscle gain", price: 47, nutrition: n(322, 29, 40, 30, 6), accent: "#f4a91d", imagePosition: "64%" },
  { id: "berry-recovery", name: "Berry Recovery", description: "Mixed berries, banana and berry whey.", category: "Shakes", goal: "Post workout", price: 47, nutrition: n(298, 27, 41, 26, 5), accent: "#8a3f91", imagePosition: "75%", popular: true },
  { id: "green-force", name: "Green Force", description: "Pineapple, kiwi, spinach and vegan protein.", category: "Smoothies", goal: "Vegan", price: 48, nutrition: n(276, 24, 40, 28, 4), accent: "#69a954", imagePosition: "91%", vegan: true },
  { id: "tropical-recovery", name: "Tropical Recovery", description: "Pineapple, mango, coconut and electrolytes.", category: "Smoothies", goal: "Recovery", price: 43, nutrition: n(230, 5, 46, 36, 4), accent: "#e7b73c", imagePosition: "88%", vegan: true },
  { id: "lean-matcha", name: "Lean Matcha", description: "Matcha, almond milk and vanilla vegan protein.", category: "Matcha & tea", goal: "Low calorie", price: 44, nutrition: n(214, 23, 17, 8, 6, 70), accent: "#78a75c", imagePosition: "91%", vegan: true },
  { id: "matcha-mango", name: "Mango Matcha Cloud", description: "Mango, matcha and oat milk over ice.", category: "Matcha & tea", goal: "Energy", price: 38, nutrition: n(207, 4, 37, 26, 5, 70), accent: "#b7c45b", imagePosition: "67%", vegan: true },
  { id: "cold-brew", name: "Pure Cold Brew", description: "Slow-steeped coffee, served black over ice.", category: "Coffee", goal: "Low calorie", price: 24, nutrition: n(5, 0, 1, 0, 0, 180), accent: "#5d3826", imagePosition: "15%", vegan: true },
  { id: "iced-latte", name: "Classic Iced Latte", description: "Double espresso and milk over ice.", category: "Coffee", goal: "Energy", price: 28, nutrition: n(132, 7, 13, 12, 5, 126), accent: "#c9a17a", imagePosition: "18%" },
  { id: "orange-charge", name: "Orange Charge", description: "Fresh orange, ginger and electrolytes.", category: "Functional juice", goal: "Recovery", price: 30, nutrition: n(124, 2, 28, 22, 0), accent: "#f17622", imagePosition: "61%", vegan: true },
  { id: "berry-electrolyte", name: "Berry Electrolyte", description: "Berries, lime, water and electrolytes.", category: "Functional juice", goal: "Recovery", price: 32, nutrition: n(97, 1, 23, 17, 0), accent: "#a63c79", imagePosition: "76%", vegan: true },
  { id: "green-detox", name: "Green Refresh", description: "Apple, cucumber, mint, lemon and spinach.", category: "Functional juice", goal: "Low calorie", price: 32, nutrition: n(112, 2, 25, 19, 1), accent: "#60a65a", imagePosition: "92%", vegan: true },
  { id: "citrus-spark", name: "Citrus Spark", description: "Orange, lemon, sparkling water and mint.", category: "Functional water", goal: "Low calorie", price: 22, nutrition: n(48, 1, 11, 9, 0), accent: "#ffb126", imagePosition: "62%", vegan: true },
  { id: "protein-oats", name: "Protein Overnight Oats", description: "Oats, yogurt, berries and vanilla protein.", category: "Healthy food", goal: "Meal replacement", price: 38, nutrition: n(391, 29, 49, 19, 10), accent: "#ac7c55", imagePosition: "74%" },
  { id: "acai-bowl", name: "Açaí Protein Bowl", description: "Açaí, banana, berries, granola and protein.", category: "Healthy food", goal: "Post workout", price: 49, nutrition: n(438, 24, 61, 34, 12), accent: "#752e79", imagePosition: "77%", vegan: true },
  { id: "egg-wrap", name: "Power Egg Wrap", description: "Egg, turkey, avocado and fresh vegetables.", category: "Healthy food", goal: "Meal replacement", price: 42, nutrition: n(421, 31, 37, 6, 17), accent: "#d4a244", imagePosition: "55%" },
  { id: "protein-brownie", name: "Protein Brownie", description: "Rich cocoa brownie with whey and almonds.", category: "Healthy food", goal: "High protein", price: 24, nutrition: n(248, 17, 24, 10, 10), accent: "#6f3429", imagePosition: "36%" },
]

export const builderGroups: Record<string, BuilderOption[]> = {
  size: [
    { id: "small", name: "Small · 300 ml", price: 0, nutrition: n(0, 0, 0, 0, 0), accent: "#d9d9d9" },
    { id: "medium", name: "Medium · 450 ml", price: 5, nutrition: n(0, 0, 0, 0, 0), accent: "#ffffff" },
    { id: "large", name: "Large · 600 ml", price: 10, nutrition: n(0, 0, 0, 0, 0), accent: "#e31525" },
  ],
  base: [
    { id: "water", name: "Water", price: 0, nutrition: n(0, 0, 0, 0, 0), accent: "#8ed7ff" },
    { id: "whole-milk", name: "Whole milk", price: 4, nutrition: n(153, 8, 12, 12, 8), allergen: "Milk", accent: "#fff7da" },
    { id: "skim-milk", name: "Skimmed milk", price: 4, nutrition: n(88, 8.5, 12, 12, 0.3), allergen: "Milk", accent: "#f4f4f4" },
    { id: "lactose-free", name: "Lactose-free milk", price: 6, nutrition: n(118, 8, 12, 12, 4), allergen: "Milk", accent: "#f7ead0" },
    { id: "almond-milk", name: "Almond milk", price: 7, nutrition: n(38, 1.5, 2, 0, 3), allergen: "Nuts", accent: "#d9b98d" },
    { id: "oat-milk", name: "Oat milk", price: 7, nutrition: n(115, 2.5, 17, 10, 4), allergen: "Oats", accent: "#d9c39b" },
    { id: "coconut-milk", name: "Coconut drink", price: 7, nutrition: n(55, 0.5, 3, 2, 4.5), accent: "#f0eee5" },
  ],
  coffee: [
    { id: "no-coffee", name: "No coffee", price: 0, nutrition: n(0, 0, 0, 0, 0), accent: "#666" },
    { id: "espresso", name: "1 espresso", price: 5, nutrition: n(2, 0.1, 0, 0, 0, 63), accent: "#5a2f1b" },
    { id: "double", name: "Double espresso", price: 8, nutrition: n(4, 0.2, 0, 0, 0, 126), accent: "#3b1d12" },
    { id: "decaf", name: "Decaf espresso", price: 6, nutrition: n(2, 0.1, 0, 0, 0, 3), accent: "#76543b" },
    { id: "cold-brew-shot", name: "Cold brew", price: 8, nutrition: n(5, 0.3, 1, 0, 0, 150), accent: "#432416" },
  ],
  protein: [
    { id: "none", name: "No protein", price: 0, nutrition: n(0, 0, 0, 0, 0), accent: "#666" },
    { id: "whey-vanilla", name: "Vanilla whey · 30 g", price: 13, nutrition: n(120, 24, 3, 2, 2), allergen: "Milk", accent: "#f3dfaa" },
    { id: "whey-chocolate", name: "Chocolate whey · 30 g", price: 13, nutrition: n(123, 23, 4, 2, 2), allergen: "Milk", accent: "#7a4937" },
    { id: "whey-strawberry", name: "Strawberry whey · 30 g", price: 13, nutrition: n(121, 23, 4, 2, 2), allergen: "Milk", accent: "#ef8794" },
    { id: "isolate", name: "Whey isolate · 30 g", price: 16, nutrition: n(109, 26, 1, 0, 0.5), allergen: "Milk", accent: "#e9f1f4" },
    { id: "vegan", name: "Vegan protein · 30 g", price: 16, nutrition: n(118, 22, 4, 1, 2.5), accent: "#98b466" },
    { id: "half-whey", name: "Half scoop whey · 15 g", price: 7, nutrition: n(60, 12, 1.5, 1, 1), allergen: "Milk", accent: "#e6d1a6" },
  ],
  fruit: [
    { id: "none-fruit", name: "No fruit", price: 0, nutrition: n(0, 0, 0, 0, 0), accent: "#555" },
    { id: "strawberry", name: "Strawberry", price: 5, nutrition: n(32, 0.7, 7.7, 4.9, 0.3), accent: "#ed445b" },
    { id: "mango", name: "Mango", price: 6, nutrition: n(60, 0.8, 15, 13.7, 0.4), accent: "#f5a919" },
    { id: "banana", name: "Banana", price: 5, nutrition: n(89, 1.1, 23, 12, 0.3), accent: "#f2d550" },
    { id: "mixed-berries", name: "Mixed berries", price: 7, nutrition: n(50, 0.8, 12, 7, 0.4), accent: "#85377a" },
    { id: "dates", name: "Dates", price: 5, nutrition: n(83, 0.7, 22, 19, 0.1), accent: "#884727" },
    { id: "pineapple", name: "Pineapple", price: 6, nutrition: n(50, 0.5, 13, 10, 0.1), accent: "#efc62e" },
    { id: "orange", name: "Orange", price: 5, nutrition: n(47, 0.9, 12, 9, 0.1), accent: "#f47b20" },
    { id: "kiwi", name: "Kiwi", price: 6, nutrition: n(61, 1.1, 15, 9, 0.5), accent: "#7faa48" },
  ],
  flavor: [
    { id: "no-flavor", name: "No flavour", price: 0, nutrition: n(0, 0, 0, 0, 0), accent: "#555" },
    { id: "cocoa", name: "Cocoa", price: 3, nutrition: n(23, 2, 6, 0, 1.4), accent: "#6d3828" },
    { id: "vanilla", name: "Vanilla", price: 3, nutrition: n(12, 0, 3, 2, 0), accent: "#efe2b7" },
    { id: "caramel-sf", name: "Sugar-free caramel", price: 4, nutrition: n(8, 0, 2, 0, 0), accent: "#b97737" },
    { id: "hazelnut-sf", name: "Sugar-free hazelnut", price: 4, nutrition: n(8, 0, 2, 0, 0), allergen: "May contain nuts", accent: "#9b6c45" },
    { id: "pistachio", name: "Pistachio", price: 7, nutrition: n(72, 2, 8, 6, 4), allergen: "Nuts", accent: "#8bab65" },
    { id: "peanut-butter", name: "Peanut butter", price: 6, nutrition: n(94, 4, 3, 1.5, 8), allergen: "Peanuts", accent: "#b56f36" },
    { id: "cinnamon", name: "Cinnamon", price: 1, nutrition: n(6, 0.1, 2, 0, 0), accent: "#a55c31" },
  ],
  boost: [
    { id: "no-boost", name: "No booster", price: 0, nutrition: n(0, 0, 0, 0, 0), accent: "#555" },
    { id: "creatine", name: "Creatine · 3 g", price: 6, nutrition: n(0, 0, 0, 0, 0), accent: "#e6e6e6" },
    { id: "collagen", name: "Collagen · 10 g", price: 10, nutrition: n(36, 9, 0, 0, 0), accent: "#f3d1c7" },
    { id: "electrolytes", name: "Electrolytes", price: 6, nutrition: n(5, 0, 1, 0, 0), accent: "#8ed7ff" },
    { id: "oats", name: "Oats · 30 g", price: 4, nutrition: n(114, 3.8, 19, 0.3, 2.3), allergen: "Oats", accent: "#c9ad7f" },
    { id: "chia", name: "Chia seeds · 10 g", price: 4, nutrition: n(49, 1.7, 4.2, 0, 3.1), accent: "#777" },
    { id: "extra-protein", name: "Extra half scoop", price: 7, nutrition: n(60, 12, 1.5, 1, 1), allergen: "Milk", accent: "#e5d2ac" },
  ],
}

export const builderDefaults: Record<string, string> = {
  size: "medium",
  base: "skim-milk",
  coffee: "double",
  protein: "whey-vanilla",
  fruit: "none-fruit",
  flavor: "no-flavor",
  boost: "no-boost",
}

export const categories = ["All", ...Array.from(new Set(products.map((product) => product.category)))]

export const goals = ["All goals", ...Array.from(new Set(products.map((product) => product.goal)))]

