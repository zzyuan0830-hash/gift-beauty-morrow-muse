import test from "node:test";
import assert from "node:assert/strict";
import { DesignBag, DESIGN_BAG_KEY } from "../lib/design-bag";
import { designProducts } from "../lib/design-catalog";
import { eligible } from "../lib/rules";
import { storeState, settings, checkoutAllowed } from "../lib/config";
function storage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };
}
test("all nine concepts fail real product eligibility and use separate identifiers", () => {
  assert.equal(designProducts.length, 9);
  for (const p of designProducts) {
    assert.equal(eligible(p), false);
    assert.equal(p.variants.nodes[0].availableForSale, false);
    assert.match(p.variants.nodes[0].id, /^concept-/);
    assert.ok(p.images.nodes.every((i) => i.url.startsWith("/concepts/")));
  }
});
test("design bag totals, reload, quantity limits and removal", () => {
  const s = storage(),
    bag = new DesignBag(() => s);
  assert.ok(
    bag.change({ action: "add", variantId: "concept-variant-1", quantity: 2 })
      .ok,
  );
  bag.change({ action: "add", variantId: "concept-variant-4", quantity: 1 });
  assert.equal(bag.get().cart.total.amount, "210.00");
  assert.equal(new DesignBag(() => s).get().cart.quantity, 3);
  assert.equal(
    bag.change({ action: "update", lineId: "concept-variant-1", quantity: 21 })
      .ok,
    false,
  );
  bag.change({ action: "remove", lineId: "concept-variant-4" });
  assert.equal(bag.get().cart.total.amount, "156.00");
});
test("corrupt or malicious saved bag safely resets with a visible explanation", () => {
  for (const value of [
    "null",
    "invalid",
    '{"version":1,"items":[{"variantId":"concept-variant-1","quantity":-1}]}',
    '{"version":1,"items":[{"variantId":"<script>alert(1)</script>","quantity":1}]}',
  ]) {
    const s = storage();
    s.setItem(DESIGN_BAG_KEY, value);
    const view = new DesignBag(() => s).get();
    assert.equal(view.cart.quantity, 0);
    assert.match(view.message, /reset/);
  }
});
test("denied browser storage preserves in-page preview without pretending persistence", () => {
  const bag = new DesignBag(() => {
    throw new DOMException("Denied", "SecurityError");
  });
  const r = bag.change({
    action: "add",
    variantId: "concept-variant-2",
    quantity: 1,
  });
  assert.equal(r.ok, true);
  assert.match(r.message, /page session/);
  assert.equal(bag.get().cart.total.amount, "48.00");
});
test("preview checkout never yields an order or URL; submitted prices and notes ignored", () => {
  const s = storage(),
    bag = new DesignBag(() => s);
  bag.change({
    action: "add",
    variantId: "concept-variant-1",
    quantity: 1,
    price: 0,
    note: "<script>bad()</script>".repeat(300),
  });
  const r = bag.change({ action: "checkout" });
  assert.equal(r.ok, false);
  assert.match(r.message, /no order is created/);
  assert.equal("checkoutUrl" in r, false);
  assert.equal(bag.get().cart.total.amount, "78.00");
  assert.equal(s.getItem(DESIGN_BAG_KEY)?.includes("<script>"), false);
});
test("design mode renders pages but cannot activate Shopify settings or checkout", () => {
  delete process.env.E2E_FIXTURE;
  process.env.STORE_MODE = "design";
  assert.equal(storeState().mode, "design");
  assert.throws(settings);
  assert.equal(
    checkoutAllowed("https://example.myshopify.com/checkouts/x"),
    false,
  );
  process.env.STORE_MODE = "maintenance";
});

test("header quantity read does not consume corrupt-storage recovery warning", () => {
  const s = storage();
  s.setItem(DESIGN_BAG_KEY, "null");
  const bag = new DesignBag(() => s);
  assert.equal(bag.get(false).cart.quantity, 0);
  assert.equal(s.getItem(DESIGN_BAG_KEY), "null");
  assert.match(bag.get().message, /reset/);
  assert.notEqual(s.getItem(DESIGN_BAG_KEY), "null");
});
