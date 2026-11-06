import { designProducts } from "./design-catalog";
import type { PublicCart } from "./types";
import { validQuantity } from "./rules";
type Item = { variantId: string; quantity: number };
type StorageLike = Pick<Storage, "getItem" | "setItem">;
export const DESIGN_BAG_KEY = "morrow-muse-design-bag-v3";
export class DesignBag {
  private memory: Item[] = [];
  constructor(private storage: () => StorageLike) {}
  private read(repair = true) {
    let warning = "";
    try {
      const raw = this.storage().getItem(DESIGN_BAG_KEY);
      if (raw === null) {
        this.memory = [];
        return { items: this.memory, warning };
      }
      const data = JSON.parse(raw);
      if (
        !data ||
        typeof data !== "object" ||
        data.version !== 1 ||
        !Array.isArray(data.items) ||
        data.items.length > 9 ||
        !data.items.every(
          (i: Item) =>
            i &&
            validQuantity(i.quantity) &&
            designProducts.some((p) => p.variants.nodes[0].id === i.variantId),
        ) ||
        new Set(data.items.map((i: Item) => i.variantId)).size !==
          data.items.length
      )
        throw new Error("corrupt");
      this.memory = data.items.map((i: Item) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      }));
    } catch (error) {
      if (
        error instanceof SyntaxError ||
        (error instanceof Error && error.message === "corrupt")
      ) {
        this.memory = [];
        warning = "Saved preview bag was invalid and has been reset.";
        try {
          if (repair)
            this.storage().setItem(
              DESIGN_BAG_KEY,
              JSON.stringify({ version: 1, items: [] }),
            );
        } catch {}
      } else
        warning =
          "Browser storage is unavailable. This preview bag lasts only for this page session.";
    }
    return { items: this.memory, warning };
  }
  private view(items: Item[]): PublicCart {
    const lines = items.map((i) => {
      const p = designProducts.find(
          (p) => p.variants.nodes[0].id === i.variantId,
        )!,
        v = p.variants.nodes[0];
      return {
        id: i.variantId,
        quantity: i.quantity,
        title: p.title,
        variant: "Design concept",
        handle: p.handle,
        image: p.images.nodes[0],
        unit: v.price,
        total: {
          amount: (
            (Math.round(Number(v.price.amount) * 100) * i.quantity) /
            100
          ).toFixed(2),
          currencyCode: "USD",
        },
        available: true,
      };
    });
    const amount = (
      lines.reduce((s, l) => s + Math.round(Number(l.total.amount) * 100), 0) /
      100
    ).toFixed(2);
    return {
      lines,
      subtotal: { amount, currencyCode: "USD" },
      total: { amount, currencyCode: "USD" },
      quantity: items.reduce((s, i) => s + i.quantity, 0),
      digest: "design-only",
      blocked: false,
    };
  }
  get(repair = true) {
    const { items, warning } = this.read(repair);
    return { ok: true, cart: this.view(items), message: warning };
  }
  change(data: Record<string, unknown>) {
    const { items, warning } = this.read();
    if (data.action === "checkout")
      return {
        ok: false,
        cart: this.view(items),
        message:
          "This is a design preview. Checkout is not connected; no payment is collected and no order is created.",
      };
    const id = data.action === "add" ? data.variantId : data.lineId;
    const p = designProducts.find((p) => p.variants.nodes[0].id === id);
    if (!p || !["add", "update", "remove"].includes(String(data.action)))
      return { ok: false, message: "Please select a valid concept." };
    const existing = items.find((i) => i.variantId === id);
    if (data.action !== "add" && !existing)
      return {
        ok: false,
        message:
          "This concept is no longer in your preview bag. Please reload it.",
      };
    const qty =
      data.action === "add"
        ? (existing?.quantity || 0) + Number(data.quantity)
        : data.quantity;
    if (
      data.action !== "remove" &&
      (!validQuantity(data.quantity) || !validQuantity(qty))
    )
      return { ok: false, message: "Choose a quantity from 1 to 20." };
    let next = items.filter((i) => i.variantId !== id);
    if (data.action !== "remove")
      next.push({ variantId: String(id), quantity: qty as number });
    this.memory = next;
    let message = warning;
    try {
      this.storage().setItem(
        DESIGN_BAG_KEY,
        JSON.stringify({ version: 1, items: next }),
      );
    } catch {
      message =
        "Browser storage is unavailable. This preview bag lasts only for this page session.";
    }
    return {
      ok: true,
      cart: this.view(next),
      message:
        message ||
        "Preview bag updated. Prices are illustrative; no order has been placed.",
    };
  }
}
