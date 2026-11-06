import type { Product, Cart } from "../lib/types";
export function fixtureProduct(i = 1): Product {
  const category = i <= 3 ? "gift-sets" : i <= 6 ? "fragrance" : "body-care";
  const title =
    [
      "Sunday Gift Set",
      "Little Thank You",
      "Evening Gift Set",
      "Fig Fragrance",
      "Amber Fragrance",
      "Petal Fragrance",
      "Body Cream",
      "Bath Soak",
      "Body Oil",
    ][i - 1] || "Unapproved item";
  return {
    id: `gid://shopify/Product/${i}`,
    handle: `fixture-${i}`,
    title: `Fixture ${title}`,
    description:
      "Local automated-test merchandise. Not a real product and never for sale.",
    descriptionHtml:
      "<p>Local automated-test merchandise. Not a real product and never for sale.</p>",
    productType: category,
    updatedAt: `2026-10-${String(i).padStart(2, "0")}T00:00:00Z`,
    images: {
      nodes: [1, 2, 3].map((n) => ({
        url: `https://cdn.shopify.com/test-only/${i}-${n}.svg`,
        altText: `Test-only ${title}: ${["front", "detail", "contents"][n - 1]}`,
        width: 800,
        height: 1000,
      })),
    },
    variants: {
      nodes: [
        {
          id: `gid://shopify/ProductVariant/${i}`,
          title: "Default Title",
          sku: `TEST-${i}`,
          availableForSale: true,
          quantityAvailable: 10,
          price: { amount: String(i * 10 + 20) + ".00", currencyCode: "USD" },
          selectedOptions: [],
        },
      ],
      pageInfo: { hasNextPage: false },
    },
    metafields: Object.entries({
      approved: "true",
      images_verified: "true",
      shipping_verified: "true",
      preassembled: "true",
      category,
      specifications: "Fixture specifications; not real.",
      contents: "Fixture contents; not real.",
      usage: "Fixture instructions; not real.",
      ingredients: "Fixture ingredients; not real.",
    }).map(([key, value]) => ({ key, value })),
  };
}
export function fixtureCart(): Cart {
  const product = fixtureProduct();
  return {
    id: "gid://shopify/Cart/test?key=fixture-secret",
    checkoutUrl: "https://fixture.myshopify.com/checkouts/test-only",
    totalQuantity: 1,
    cost: {
      subtotalAmount: { amount: "30.00", currencyCode: "USD" },
      totalAmount: { amount: "30.00", currencyCode: "USD" },
    },
    lines: {
      nodes: [
        {
          id: "gid://shopify/CartLine/1",
          quantity: 1,
          cost: { totalAmount: { amount: "30.00", currencyCode: "USD" } },
          merchandise: { ...product.variants.nodes[0], product },
        },
      ],
      pageInfo: { hasNextPage: false },
    },
  };
}
