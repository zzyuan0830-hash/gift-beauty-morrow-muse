import type { PublicCart } from "./types";
import { DesignBag } from "./design-bag";
export type BagResult = {
  ok: boolean;
  cart?: PublicCart;
  message?: string;
  checkoutUrl?: string;
};
const designBag = new DesignBag(() => window.localStorage);
export function readPreviewQuantity() {
  return designBag.get(false).cart.quantity;
}
export async function readBag(preview: boolean): Promise<BagResult> {
  if (preview) return designBag.get();
  const r = await fetch("/api/cart", { cache: "no-store" });
  return { ...(await r.json()), ok: r.ok };
}
export async function changeBag(
  preview: boolean,
  data: Record<string, unknown>,
): Promise<BagResult> {
  if (preview) {
    const result = designBag.change(data);
    window.dispatchEvent(new Event("morrow-bag-updated"));
    return result;
  }
  const r = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { ...(await r.json()), ok: r.ok };
}
