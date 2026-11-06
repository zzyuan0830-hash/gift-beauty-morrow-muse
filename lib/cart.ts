import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "node:crypto";
import { settings } from "./config";
import { eligible } from "./rules";
import type { Cart, PublicCart } from "./types";
export function seal(id: string) {
  const c = settings(),
    key = Buffer.from(c.secret, "base64"),
    iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(c.domain));
  return Buffer.concat([
    iv,
    cipher.update(id),
    cipher.final(),
    cipher.getAuthTag(),
  ]).toString("base64url");
}
export function unseal(value: string | undefined) {
  try {
    if (!value || value.length > 4000 || value.length < 40) return null;
    const c = settings(),
      b = Buffer.from(value, "base64url"),
      dec = createDecipheriv(
        "aes-256-gcm",
        Buffer.from(c.secret, "base64"),
        b.subarray(0, 12),
        { authTagLength: 16 },
      );
    dec.setAAD(Buffer.from(c.domain));
    dec.setAuthTag(b.subarray(-16));
    const id = Buffer.concat([
      dec.update(b.subarray(12, -16)),
      dec.final(),
    ]).toString();
    return id.startsWith("gid://shopify/Cart/") ? id : null;
  } catch {
    return null;
  }
}
export const emptyCart: PublicCart = {
  lines: [],
  subtotal: { amount: "0", currencyCode: "USD" },
  total: { amount: "0", currencyCode: "USD" },
  digest: "empty",
  quantity: 0,
  blocked: false,
};
export function publicCart(c: Cart): PublicCart {
  const lines = c.lines.nodes.map((l) => ({
    id: l.id,
    quantity: l.quantity,
    title: l.merchandise.product.title,
    variant: l.merchandise.title,
    handle: l.merchandise.product.handle,
    image: l.merchandise.product.images.nodes[0] || null,
    unit: l.merchandise.price,
    total: l.cost.totalAmount,
    available:
      eligible(l.merchandise.product) &&
      l.merchandise.availableForSale &&
      l.quantity <= 20 &&
      (l.merchandise.quantityAvailable == null ||
        l.merchandise.quantityAvailable >= l.quantity),
  }));
  const blocked =
    c.lines.pageInfo.hasNextPage ||
    lines.some((l) => !l.available) ||
    c.cost.totalAmount.currencyCode !== "USD";
  const digest = createHash("sha256")
    .update(JSON.stringify({ lines, cost: c.cost, blocked }))
    .digest("hex");
  return {
    lines,
    subtotal: c.cost.subtotalAmount,
    total: c.cost.totalAmount,
    digest,
    quantity: c.totalQuantity,
    blocked,
  };
}
