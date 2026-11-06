import type { Product } from "./types";
import { filterProducts } from "./rules";
export const giftPreferences = {
  all: { label: "A little of everything", category: "" },
  rituals: { label: "Everyday care rituals", category: "body-care" },
  fragrance: { label: "A love of fragrance", category: "fragrance" },
  sets: { label: "A gift to open together", category: "gift-sets" },
} as const;
export const giftBudgets = {
  all: "Any budget",
  "50": "$50 or less",
  "75": "$75 or less",
  "100": "$100 or less",
} as const;
export function giftSelection(
  products: Product[],
  raw: Record<string, string | string[] | undefined>,
) {
  const preference =
    typeof raw.preference === "string" &&
    Object.hasOwn(giftPreferences, raw.preference)
      ? (raw.preference as keyof typeof giftPreferences)
      : "all";
  const budget =
    typeof raw.budget === "string" && Object.hasOwn(giftBudgets, raw.budget)
      ? (raw.budget as keyof typeof giftBudgets)
      : "all";
  return {
    preference,
    budget,
    products: filterProducts(products, {
      category: giftPreferences[preference].category,
      max: budget === "all" ? undefined : budget,
      sort: "price-asc",
    }),
  };
}
