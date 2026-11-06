// LOCAL TEST SERVICE ONLY. Never deployed or used for real commerce.
import http from "node:http";
import { fixtureProduct } from "./fixtures";
import type { Cart, Product } from "../lib/types";
let products: Product[] = [],
  carts = new Map<
    string,
    { variantId: string; quantity: number; id: string }[]
  >(),
  counter = 0,
  fail = false,
  missingPolicy = false,
  rejectMutation = false;
function reset() {
  products = Array.from({ length: 9 }, (_, i) => fixtureProduct(i + 1));
  const draft = fixtureProduct(10);
  draft.metafields = [];
  products.push(draft);
  carts.clear();
  counter = 0;
  fail = false;
  missingPolicy = false;
  rejectMutation = false;
}
reset();
function cart(id: string): Cart | null {
  const entries = carts.get(id);
  if (!entries) return null;
  const lines = entries.map((e) => {
    const p = products.find((p) =>
      p.variants.nodes.some((v) => v.id === e.variantId),
    )!;
    const v = p.variants.nodes.find((v) => v.id === e.variantId)!;
    return {
      id: e.id,
      quantity: e.quantity,
      cost: {
        totalAmount: {
          amount: (Number(v.price.amount) * e.quantity).toFixed(2),
          currencyCode: "USD",
        },
      },
      merchandise: { ...v, product: p },
    };
  });
  const amount = lines
    .reduce((s, l) => s + Number(l.cost.totalAmount.amount), 0)
    .toFixed(2);
  return {
    id,
    checkoutUrl: "https://fixture.myshopify.com/checkouts/test-only",
    totalQuantity: lines.reduce((s, l) => s + l.quantity, 0),
    cost: {
      subtotalAmount: { amount, currencyCode: "USD" },
      totalAmount: { amount, currencyCode: "USD" },
    },
    lines: { nodes: lines, pageInfo: { hasNextPage: false } },
  };
}
http
  .createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    res.setHeader("Content-Type", "application/json");
    const send = (data: unknown, status = 200) => {
      res.statusCode = status;
      res.end(JSON.stringify(data));
    };
    if (req.url === "/health") return send({ testOnly: true });
    let data;
    try {
      data = JSON.parse(body || "{}");
    } catch {
      return send({}, 400);
    }
    if (req.url === "/control") {
      if (data.reset) reset();
      if (data.price)
        products[0].variants.nodes[0].price.amount = String(data.price);
      if (data.stock !== undefined) {
        products[0].variants.nodes[0].quantityAvailable = data.stock;
        products[0].variants.nodes[0].availableForSale = data.stock > 0;
      }
      if (data.unapprove) products[0].metafields = [];
      if (data.expire) carts.clear();
      if (data.fail !== undefined) fail = data.fail;
      if (data.missingPolicy !== undefined) missingPolicy = data.missingPolicy;
      if (data.rejectMutation !== undefined)
        rejectMutation = data.rejectMutation;
      return send({ ok: true });
    }
    if (req.url !== "/graphql") return send({}, 404);
    if (fail)
      return send(
        { errors: [{ message: "Intentional local fixture failure" }] },
        503,
      );
    const { query: q, variables: v = {} } = data;
    let result: unknown;
    if (q.includes("query Catalog"))
      result = {
        products: {
          nodes: v.after ? [] : products,
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      };
    else if (q.includes("query Product("))
      result = { product: products.find((p) => p.handle === v.handle) || null };
    else if (q.includes("query Variant")) {
      const p = products.find((p) =>
        p.variants.nodes.some((n) => n.id === v.id),
      );
      result = {
        node: p
          ? { ...p.variants.nodes.find((n) => n.id === v.id), product: p }
          : null,
      };
    } else if (q.includes("query Bag")) result = { cart: cart(v.id) };
    else if (q.includes("query Policies")) {
      const policy = {
        title: "Test-only policy",
        body: "<p>Local test policy, not a real commercial commitment.</p>",
      };
      result = {
        shop: {
          name: "Fixture shop",
          privacyPolicy: policy,
          refundPolicy: policy,
          shippingPolicy: missingPolicy ? null : policy,
          termsOfService: policy,
        },
      };
    } else {
      let field = "",
        id = v.cartId;
      if (q.includes("mutation CreateBag")) {
        field = "cartCreate";
        id = `gid://shopify/Cart/${++counter}?key=fixture-secret`;
        carts.set(id, []);
      } else if (q.includes("mutation AddLines")) field = "cartLinesAdd";
      else if (q.includes("mutation UpdateLines")) field = "cartLinesUpdate";
      else if (q.includes("mutation RemoveLines")) field = "cartLinesRemove";
      else
        return send({ errors: [{ message: "Unknown test operation" }] }, 400);
      if (rejectMutation)
        return send({
          data: {
            [field]: {
              cart: cart(id),
              userErrors: [{ code: "INVALID", message: "Test rejection" }],
            },
          },
        });
      let lines = carts.get(id) || [];
      if (field === "cartCreate" || field === "cartLinesAdd") {
        for (const line of v.lines || v.input.lines) {
          const existing = lines.find(
            (l) => l.variantId === line.merchandiseId,
          );
          if (existing) existing.quantity += line.quantity;
          else
            lines.push({
              variantId: line.merchandiseId,
              quantity: line.quantity,
              id: `gid://shopify/CartLine/${++counter}`,
            });
        }
      }
      if (field === "cartLinesUpdate")
        for (const line of v.lines) {
          const existing = lines.find((l) => l.id === line.id);
          if (existing) existing.quantity = line.quantity;
        }
      if (field === "cartLinesRemove")
        lines = lines.filter((l) => !v.lineIds.includes(l.id));
      carts.set(id, lines);
      result = { [field]: { cart: cart(id), userErrors: [] } };
    }
    return send({ data: result });
  })
  .listen(4399, "127.0.0.1", () =>
    console.log(
      "Local Shopify contract fixture at 127.0.0.1:4399; no real payments",
    ),
  );
