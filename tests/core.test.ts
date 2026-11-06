import test from "node:test";
import assert from "node:assert/strict";
import { fixtureProduct, fixtureCart } from "./fixtures";
import {
  eligible,
  productIssues,
  filterProducts,
  validQuantity,
} from "../lib/rules";
import { cleanHtml, jsonLd } from "../lib/content";
import { seal, unseal, publicCart } from "../lib/cart";
import { settings, checkoutAllowed } from "../lib/config";
function setup() {
  Object.assign(process.env, {
    STORE_MODE: "test",
    STORE_INDEPENDENT_CONFIRMED: "true",
    SHOPIFY_STORE_DOMAIN: "independent-test.myshopify.com",
    SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "test-not-real",
    SHOPIFY_API_VERSION: "2026-10",
    CART_COOKIE_SECRET: Buffer.alloc(32, 7).toString("base64"),
    SITE_URL: "https://example.test",
    SHOPIFY_TEST_PAYMENTS_CONFIRMED: "true",
  });
  delete process.env.E2E_FIXTURE;
}
test("only verified complete products enter catalog", () => {
  const p = fixtureProduct();
  assert.ok(eligible(p));
  for (const key of [
    "approved",
    "images_verified",
    "shipping_verified",
    "contents",
    "usage",
    "ingredients",
    "specifications",
    "category",
    "preassembled",
  ]) {
    const q = structuredClone(p);
    q.metafields = q.metafields.filter((m) => m?.key !== key);
    assert.equal(eligible(q), false, key);
  }
});
test("reject duplicate photos, unsafe image hosts, missing SKU, non-USD and partial variants", () => {
  const p = fixtureProduct();
  for (const mutate of [
    (p: import("../lib/types").Product) => {
      p.images.nodes[2] = p.images.nodes[0];
    },
    (p: import("../lib/types").Product) => {
      p.images.nodes[0].url = "https://evil.test/a.jpg";
    },
    (p: import("../lib/types").Product) => {
      p.variants.nodes[0].sku = "";
    },
    (p: import("../lib/types").Product) => {
      p.variants.nodes[0].price.currencyCode = "CNY";
    },
    (p: import("../lib/types").Product) => {
      p.variants.pageInfo.hasNextPage = true;
    },
  ]) {
    const q = structuredClone(p);
    mutate(q);
    assert.ok(productIssues(q).length);
  }
});
test("filter search, categories, bounds, order and empty results", () => {
  const p = [1, 2, 4, 7].map(fixtureProduct);
  assert.deepEqual(
    filterProducts(p, { category: "fragrance" }).map((p) => p.handle),
    ["fixture-4"],
  );
  assert.equal(filterProducts(p, { q: "no-match" }).length, 0);
  assert.deepEqual(
    filterProducts(p, { min: "40", max: "60", sort: "price-desc" }).map(
      (p) => p.handle,
    ),
    ["fixture-4", "fixture-2"],
  );
  assert.equal(filterProducts(p, { q: "BODY" }).length, 1);
  assert.equal(filterProducts(p, { min: "100", max: "20" }).length, 0);
});
test("quantity is strictly bounded integer input", () => {
  for (const v of [0, 21, 1.5, NaN, "2", null])
    assert.equal(validQuantity(v), false);
  assert.ok(validQuantity(1));
  assert.ok(validQuantity(20));
});
test("cart cookie encrypted, tamper-resistant, shop bound and gracefully rejects corruption", () => {
  setup();
  const id = "gid://shopify/Cart/demo?key=do-not-expose";
  const token = seal(id);
  assert.equal(unseal(token), id);
  assert.ok(!token.includes("do-not-expose"));
  assert.equal(unseal(token.slice(0, -8) + "aaaaaaaa"), null);
  assert.equal(unseal("broken"), null);
  process.env.SHOPIFY_STORE_DOMAIN = "other-test.myshopify.com";
  assert.equal(unseal(token), null);
});
test("cart digest captures repricing and quantity changes; hides secret and checkout URL", () => {
  setup();
  const cart = fixtureCart(),
    view = publicCart(cart);
  assert.ok(!JSON.stringify(view).includes("fixture-secret"));
  assert.ok(!JSON.stringify(view).includes("checkouts"));
  cart.lines.nodes[0].merchandise.price.amount = "40.00";
  assert.notEqual(publicCart(cart).digest, view.digest);
  cart.lines.nodes[0].quantity = 11;
  assert.ok(publicCart(cart).blocked);
});
test("cart blocks unapproved, mixed-currency and truncated data", () => {
  for (const mutation of [
    (c: Cart) => {
      c.lines.nodes[0].merchandise.product.metafields = [];
    },
    (c: Cart) => {
      c.cost.totalAmount.currencyCode = "CNY";
    },
    (c: Cart) => {
      c.lines.pageInfo.hasNextPage = true;
    },
  ]) {
    const c = fixtureCart();
    mutation(c);
    assert.equal(publicCart(c).blocked, true);
  }
});
import type { Cart } from "../lib/types";
test("HTML sanitization and JSON-LD escaping cannot execute input", () => {
  const html = cleanHtml(
    '<script>alert(1)</script><p onclick="bad()">Text<img src=x onerror=bad()></p><a href="javascript:bad()">link</a>',
  );
  assert.equal(html.includes("<script"), false);
  assert.equal(html.includes("onclick"), false);
  assert.equal(html.includes("javascript:"), false);
  assert.equal(html.includes("<img"), false);
  assert.ok(
    jsonLd({ name: "</script><script>bad()</script>" }).includes("\\u003c"),
  );
  assert.ok(!jsonLd({ name: "</script>" }).includes("<"));
});
test("configuration is fail-closed; production cannot use local fixture endpoint", () => {
  setup();
  assert.equal(settings().mode, "test");
  process.env.STORE_MODE = "live";
  assert.throws(settings);
  process.env.STORE_MODE = "maintenance";
  assert.throws(settings);
  process.env.STORE_MODE = "test";
  process.env.SHOPIFY_TEST_PAYMENTS_CONFIRMED = "false";
  assert.throws(settings);
  setup();
  process.env.E2E_FIXTURE = "1";
  assert.throws(settings);
  delete process.env.E2E_FIXTURE;
});
test("checkout URLs restricted to exact verified host and HTTPS", () => {
  setup();
  assert.ok(
    checkoutAllowed("https://independent-test.myshopify.com/checkouts/abc"),
  );
  assert.equal(
    checkoutAllowed(
      "https://independent-test.myshopify.com.evil.test/checkouts/abc",
    ),
    false,
  );
  assert.equal(
    checkoutAllowed("http://independent-test.myshopify.com/checkouts/abc"),
    false,
  );
  assert.equal(
    checkoutAllowed(
      "https://attacker@independent-test.myshopify.com/checkouts/abc",
    ),
    false,
  );
});

test("reject prototype category, unverified extra image and unknown inventory", () => {
  for (const mutate of [
    (p: import("../lib/types").Product) => {
      p.metafields.find((m) => m?.key === "category")!.value = "constructor";
    },
    (p: import("../lib/types").Product) => {
      p.images.nodes.push({
        url: "https://evil.test/extra.png",
        altText: "bad",
      });
    },
    (p: import("../lib/types").Product) => {
      p.variants.nodes[0].quantityAvailable = null;
    },
  ]) {
    const p = fixtureProduct();
    mutate(p);
    assert.equal(eligible(p), false);
  }
});
