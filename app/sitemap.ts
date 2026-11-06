export const dynamic = "force-dynamic";
import type { MetadataRoute } from "next";
import { storeState, settings } from "@/lib/config";
import { catalog } from "@/lib/shopify";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (storeState().mode !== "live") return [];
  const base = settings().origin;
  const fixed = [
    "",
    "/shop",
    "/about",
    "/gifting",
    "/faq",
    "/policies/shipping",
    "/policies/returns",
    "/policies/privacy",
    "/policies/terms",
  ].map((path) => ({ url: base + path }));
  const products = await catalog();
  return [
    ...fixed,
    ...products.map((p) => ({
      url: `${base}/products/${p.handle}`,
      lastModified: p.updatedAt,
    })),
  ];
}
