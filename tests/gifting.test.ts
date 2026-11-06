import test from "node:test";
import assert from "node:assert/strict";
import { giftSelection } from "../lib/gifting";
import { designProducts } from "../lib/design-catalog";
test("gift finder budget bounds, preference and price order", () => {
  assert.deepEqual(
    giftSelection(designProducts, {
      preference: "sets",
      budget: "50",
    }).products.map((p) => p.handle),
    ["the-little-thank-you"],
  );
  assert.equal(
    giftSelection(designProducts, { preference: "fragrance", budget: "50" })
      .products.length,
    0,
  );
  assert.deepEqual(
    giftSelection(designProducts, {
      preference: "fragrance",
      budget: "75",
    }).products.map((p) => p.handle),
    ["fig-and-paper", "petal-study", "amber-hour"],
  );
});
test("gift finder rejects unknown or repeated query values without inventing a catalog", () => {
  const result = giftSelection(designProducts, {
    preference: "__proto__",
    budget: ["50", "100"],
  });
  assert.equal(result.preference, "all");
  assert.equal(result.budget, "all");
  assert.equal(result.products.length, 9);
  assert.deepEqual(
    giftSelection([], { preference: "sets", budget: "100" }).products,
    [],
  );
});
