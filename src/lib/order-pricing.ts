import "server-only"

import {
  builderGroups,
  products,
  type Nutrition,
} from "@/lib/catalog"

export type OrderItemInput = {
  productId: string
  quantity: number
  selections?: Record<string, string>
}

export type CanonicalOrderItem = {
  productId: string
  name: string
  unitPrice: number
  quantity: number
  nutrition: Nutrition
  selections: Record<string, string>
}

export class OrderPricingError extends Error {}

const emptyNutrition = (): Nutrition => ({
  kcal: 0,
  protein: 0,
  carbs: 0,
  sugar: 0,
  fat: 0,
  caffeine: 0,
})

function addNutrition(total: Nutrition, addition: Nutrition): Nutrition {
  return {
    kcal: total.kcal + addition.kcal,
    protein: total.protein + addition.protein,
    carbs: total.carbs + addition.carbs,
    sugar: total.sugar + addition.sugar,
    fat: total.fat + addition.fat,
    caffeine: total.caffeine + addition.caffeine,
  }
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function priceCustomDrink(item: OrderItemInput): CanonicalOrderItem {
  const groups = Object.keys(builderGroups)
  const selections = item.selections

  if (
    !selections ||
    Object.keys(selections).length !== groups.length ||
    !groups.every((group) => typeof selections[group] === "string")
  ) {
    throw new OrderPricingError("The custom drink selection is incomplete.")
  }

  let unitPrice = 14
  let nutrition = emptyNutrition()
  const canonicalSelections: Record<string, string> = {}

  for (const group of groups) {
    const option = builderGroups[group].find(
      (candidate) => candidate.id === selections[group],
    )

    if (!option) {
      throw new OrderPricingError(`Invalid ${group} selection.`)
    }

    unitPrice += option.price
    nutrition = addNutrition(nutrition, option.nutrition)
    canonicalSelections[group] = option.name
  }

  const sizeMultiplier =
    selections.size === "small" ? 0.8 : selections.size === "large" ? 1.25 : 1

  nutrition = Object.fromEntries(
    Object.entries(nutrition).map(([key, value]) => [
      key,
      round(value * sizeMultiplier),
    ]),
  ) as Nutrition

  return {
    productId: "custom-drink",
    name: "My ESAFORCE Mix",
    unitPrice: round(unitPrice),
    quantity: item.quantity,
    nutrition,
    selections: canonicalSelections,
  }
}

function priceMenuProduct(item: OrderItemInput): CanonicalOrderItem {
  const product = products.find((candidate) => candidate.id === item.productId)

  if (!product) {
    throw new OrderPricingError("A product in the cart is no longer available.")
  }

  if (item.selections && Object.keys(item.selections).length > 0) {
    throw new OrderPricingError("Unexpected selections for a menu product.")
  }

  return {
    productId: product.id,
    name: product.name,
    unitPrice: product.price,
    quantity: item.quantity,
    nutrition: product.nutrition,
    selections: {},
  }
}

export function priceOrderItems(items: OrderItemInput[]) {
  const canonicalItems = items.map((item) =>
    item.productId === "custom-drink"
      ? priceCustomDrink(item)
      : priceMenuProduct(item),
  )

  const subtotal = round(
    canonicalItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    ),
  )

  return { items: canonicalItems, subtotal }
}
