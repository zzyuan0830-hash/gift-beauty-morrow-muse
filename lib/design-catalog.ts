import { giftStory } from "./gift-stories";
import records from "@/config/concepts.json";
import type { Product } from "./types";
export const conceptRecords = records;
const categoryMap: Record<string, string> = {
  "Beauty gift sets": "gift-sets",
  Fragrance: "fragrance",
  "Body care": "body-care",
};
export function conceptInfo(handle: string) {
  return records.find((p) => p.id === handle);
}
export const designProducts: Product[] = records.map((p, i) => ({
  id: `concept-product-${i + 1}`,
  handle: p.id,
  title: p.name,
  description: p.story,
  descriptionHtml: `<p>${p.story}</p>`,
  productType: p.category,
  updatedAt: "2026-11-06T00:00:00Z",
  images: {
    nodes: [
      {
        url: `/concepts/${p.asset}.webp`,
        altText: `${p.name} — AI-created product design concept, not a photograph of a manufactured product`,
      },
      ...(giftStory(p.id)
        ? [
            {
              url: `/concepts/${giftStory(p.id).asset}.webp`,
              altText: `${p.name} — complementary AI concept showing the closed box beside its contents; not manufactured merchandise`,
            },
          ]
        : p.id === "fig-and-paper"
          ? [
              {
                url: "/concepts/fig-detail.webp",
                altText: "Fig & Paper — AI-created bottle detail concept",
              },
              {
                url: "/concepts/wrap-ribbon.svg",
                altText: "Original proposed packaging illustration",
              },
            ]
          : [
              {
                url: "/concepts/wrap-ribbon.svg",
                altText:
                  "Original proposed packaging illustration; not another product photograph",
              },
            ]),
    ],
  },
  variants: {
    nodes: [
      {
        id: `concept-variant-${i + 1}`,
        title: "Design concept",
        sku: p.conceptCode,
        availableForSale: false,
        quantityAvailable: null,
        price: { amount: p.price.toFixed(2), currencyCode: "USD" },
        selectedOptions: [],
      },
    ],
    pageInfo: { hasNextPage: false },
  },
  metafields: Object.entries({
    category: categoryMap[p.category],
    specifications: `Concept dimensions: ${p.target.size}. Illustrative sizes only; these concepts are not physical products.`,
    contents: p.contents.map((v) => v.join(" — ")).join("\n"),
    usage:
      "Usage instructions will follow the selected formula and supplier safety documentation. No product has been manufactured or approved for use.",
    ingredients:
      "Formula and ingredients have not been selected. Scent and care descriptions are creative directions; no efficacy, certification or ingredient claims are made.",
    approved: "false",
    images_verified: "false",
    shipping_verified: "false",
    preassembled: "false",
  }).map(([key, value]) => ({ key, value })),
}));
