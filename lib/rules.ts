import type { Product, Money } from "./types";
export const categories = {
  "gift-sets": "Beauty gift sets",
  fragrance: "Fragrance",
  "body-care": "Body care",
} as const;
export function meta(p: Product, key: string) {
  return p.metafields.find((m) => m?.key === key)?.value.trim() || "";
}
export function productIssues(p: Product): string[] {
  const issues: string[] = [];
  for (const key of ["approved", "images_verified", "shipping_verified"])
    if (meta(p, key) !== "true") issues.push(key);
  for (const key of ["specifications", "contents", "usage", "ingredients"])
    if (!meta(p, key)) issues.push(key);
  if (!Object.hasOwn(categories, meta(p, "category"))) issues.push("category");
  if (meta(p, "category") === "gift-sets" && meta(p, "preassembled") !== "true")
    issues.push("preassembled");
  if (!p.title || !p.description) issues.push("description");
  const images = p.images.nodes.filter((i) => {
    try {
      return (
        new URL(i.url).hostname === "cdn.shopify.com" &&
        new URL(i.url).protocol === "https:" &&
        !!i.altText?.trim()
      );
    } catch {
      return false;
    }
  });
  if (
    images.length !== p.images.nodes.length ||
    new Set(images.map((i) => new URL(i.url).pathname)).size < 3
  )
    issues.push("images");
  if (
    !p.variants.nodes.length ||
    p.variants.pageInfo.hasNextPage ||
    p.variants.nodes.some(
      (v) =>
        !v.sku ||
        !Number.isInteger(v.quantityAvailable) ||
        Number(v.quantityAvailable) < 0 ||
        v.price.currencyCode !== "USD" ||
        !Number.isFinite(Number(v.price.amount)) ||
        Number(v.price.amount) <= 0,
    )
  )
    issues.push("variants");
  return issues;
}
export const eligible = (p: Product) => productIssues(p).length === 0;
export const validQuantity = (n: unknown): n is number =>
  typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 20;
export const formatMoney = (m: Money) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: m.currencyCode,
  }).format(Number(m.amount));
export const lowPrice = (p: Product) =>
  Math.min(...p.variants.nodes.map((v) => Number(v.price.amount)));
export function filterProducts(
  products: Product[],
  params: {
    q?: string;
    category?: string;
    min?: string;
    max?: string;
    sort?: string;
  },
) {
  const q = (params.q || "").trim().toLowerCase().slice(0, 100);
  const min =
    params.min && Number.isFinite(Number(params.min))
      ? Math.max(0, Number(params.min))
      : 0;
  const max =
    params.max && Number.isFinite(Number(params.max))
      ? Math.max(0, Number(params.max))
      : Infinity;
  const list = products.filter(
    (p) =>
      (!params.category || meta(p, "category") === params.category) &&
      (!q || (p.title + " " + p.description).toLowerCase().includes(q)) &&
      lowPrice(p) >= min &&
      lowPrice(p) <= max,
  );
  return list.sort((a, b) =>
    params.sort === "price-asc"
      ? lowPrice(a) - lowPrice(b)
      : params.sort === "price-desc"
        ? lowPrice(b) - lowPrice(a)
        : params.sort === "name"
          ? a.title.localeCompare(b.title)
          : b.updatedAt.localeCompare(a.updatedAt),
  );
}
