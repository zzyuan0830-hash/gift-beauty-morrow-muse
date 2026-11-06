import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
const control = async (request: any, data: unknown) =>
  request.post("http://127.0.0.1:4399/control", { data });
async function mockImages(page: Page) {
  await page.route("https://cdn.shopify.com/test-only/**", async (route) => {
    const match = route
      .request()
      .url()
      .match(/(\d+)-(\d+)/);
    const n = Number(match?.[1] || 1),
      view = Number(match?.[2] || 1);
    const color =
      [
        "#ead8c7",
        "#ceb7a5",
        "#b38887",
        "#a8ad8b",
        "#c89b65",
        "#d4a9b2",
        "#e2cfc3",
        "#bca49d",
        "#c4975b",
      ][n - 1] || "#ddd";
    const shape =
      n <= 3
        ? '<rect x="140" y="300" width="520" height="390" fill="#f6eddb"/><path d="M140 440h520v60H140zM360 300h65v390h-65z" fill="#682e40"/>'
        : n <= 6
          ? '<rect x="255" y="300" width="290" height="400" rx="15" fill="#f6eddb"/><rect x="305" y="220" width="190" height="100" fill="#682e40"/>'
          : '<rect x="210" y="400" width="380" height="230" rx="50" fill="#f6eddb"/><rect x="205" y="360" width="390" height="65" rx="16" fill="#682e40"/>';
    await route.fulfill({
      contentType: "image/svg+xml",
      body: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"><rect width="800" height="1000" fill="${color}"/><g transform="translate(${view === 2 ? -60 : 0},${view === 3 ? 60 : 0}) rotate(${view === 2 ? 8 : 0} 400 500)">${shape}</g><text x="400" y="830" font-size="25" fill="#38292c" text-anchor="middle" font-family="sans-serif">TEST FIXTURE ${n} · VIEW ${view}</text><text x="400" y="875" font-size="18" fill="#38292c" text-anchor="middle" font-family="sans-serif">NOT A REAL PRODUCT</text></svg>`,
    });
  });
}
async function add(page: Page, handle = "fixture-1") {
  await page.goto(`/products/${handle}`);
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Bag updated");
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
test.beforeEach(async ({ page, request }) => {
  await control(request, { reset: true });
  await mockImages(page);
});
for (const viewport of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
]) {
  test(`${viewport.name}: complete storefront, gallery, bag, accessibility and screenshots`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    const audits: unknown[] = [];
    for (const [path, label] of [
      ["/", "home"],
      ["/shop", "shop"],
      ["/products/fixture-1", "product"],
      ["/gifting", "gifting"],
      ["/about", "about"],
      ["/faq", "faq"],
      ["/policies/shipping", "shipping"],
    ]) {
      await page.goto(path);
      await expect(page.locator("h1").first()).toBeVisible();
      await page
        .locator("img")
        .evaluateAll((imgs) =>
          Promise.all(
            imgs.map((img) =>
              img instanceof HTMLImageElement
                ? ((img.loading = "eager"), img.decode().catch(() => null))
                : null,
            ),
          ),
        );
      await noOverflow(page);
      expect(
        await page
          .locator("img")
          .evaluateAll((imgs) =>
            imgs.every(
              (img) =>
                !(img instanceof HTMLImageElement) ||
                (img.complete && img.naturalWidth > 0),
            ),
          ),
      ).toBe(true);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      audits.push({ path, violations: result.violations });
      expect(result.violations).toEqual([]);
      if (["home", "shop", "product"].includes(label))
        await page.screenshot({
          path: `evidence/${viewport.name}-${label}-fixture.png`,
          fullPage: true,
        });
    }
    await page.goto("/products/fixture-1");
    const open = page.getByRole("button", {
      name: "Enlarge Fixture Sunday Gift Set image",
    });
    await open.click();
    await expect(page.locator("dialog[open]")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".gallery-controls")).toContainText("2 / 3");
    await page.keyboard.press("Escape");
    await expect(open).toBeFocused();
    if (viewport.name === "mobile") {
      const menu = page.getByRole("button", { name: "Open menu" });
      await menu.click();
      await expect(
        page.getByRole("navigation", { name: "Mobile navigation" }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(menu).toBeFocused();
      await menu.click();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Our story" })
        .click();
      await expect(page).toHaveURL(/\/about$/);
      await expect(page.locator("dialog[open]")).toHaveCount(0);
    }
    await add(page);
    await page.getByRole("spinbutton", { name: "Quantity" }).fill("2");
    await page.getByRole("button", { name: "Add to bag", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Bag updated");
    await page.goto("/bag");
    await expect(page.locator(".totals")).toContainText("$90.00");
    await page
      .getByRole("button", { name: "Decrease Fixture Sunday Gift Set" })
      .click();
    await expect(page.locator(".totals")).toContainText("$60.00");
    await page.reload();
    await expect(page.locator(".totals")).toContainText("$60.00");
    await noOverflow(page);
    await page
      .locator("img")
      .evaluateAll((imgs) =>
        Promise.all(
          imgs.map((img) =>
            img instanceof HTMLImageElement
              ? ((img.loading = "eager"), img.decode())
              : null,
          ),
        ),
      );
    await page.screenshot({
      path: `evidence/${viewport.name}-bag-fixture.png`,
      fullPage: true,
    });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    audits.push({ path: "/bag", violations: result.violations });
    expect(result.violations).toEqual([]);
    await page
      .getByRole("button", { name: "Remove Fixture Sunday Gift Set" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Your bag is empty." }),
    ).toBeVisible();
    expect(errors).toEqual([]);
    await fs.writeFile(
      `evidence/${viewport.name}-accessibility.json`,
      JSON.stringify(audits, null, 2),
    );
  });
}
test("search, categories, prices, sorting, reset and unpublished product exclusion", async ({
  page,
}) => {
  await page.goto("/shop");
  await expect(page.locator(".product-card")).toHaveCount(9);
  await page
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption("fragrance");
  await page.getByLabel("Min price ($)").fill("65");
  await page
    .getByRole("combobox", { name: "Sort by" })
    .selectOption("price-desc");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.locator(".product-card")).toHaveCount(2);
  await expect(page.locator(".product-card").first()).toContainText(
    "Fixture Petal Fragrance",
  );
  await page.getByRole("searchbox", { name: "Search" }).fill("no match");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(
    page.getByRole("heading", { name: "No matching finds." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Reset filters", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(9);
  await page.goto("/products/fixture-10");
  await expect(
    page.getByRole("heading", { name: "We couldn’t find that page." }),
  ).toBeVisible();
  await page.goto("/unknown-route");
  await expect(
    page.getByRole("heading", { name: "We couldn’t find that page." }),
  ).toBeVisible();
});
test("cookie security, rejected origin/input, ignored client pricing, duplicate click guard", async ({
  page,
  context,
}) => {
  await page.goto("/products/fixture-1");
  await page
    .getByRole("button", { name: "Add to bag", exact: true })
    .evaluate((b: HTMLButtonElement) => {
      b.click();
      b.click();
    });
  await expect(page.getByRole("status")).toContainText("Bag updated");
  await page.goto("/bag");
  await expect(page.locator(".totals")).toContainText("$30.00");
  const cookies = await context.cookies();
  const cookie = cookies.find((c) => c.name === "mm_cart")!;
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe("Lax");
  expect(cookie.value).not.toContain("fixture-secret");
  const foreign = await page.request.post("/api/cart", {
    headers: { origin: "https://evil.test" },
    data: {
      action: "add",
      variantId: "gid://shopify/ProductVariant/1",
      quantity: 1,
    },
  });
  expect(foreign.status()).toBe(403);
  for (const quantity of [0, 21, 1.5, "2"]) {
    const r = await page.request.post("/api/cart", {
      headers: { origin: "http://127.0.0.1:4391" },
      data: {
        action: "add",
        variantId: "gid://shopify/ProductVariant/1",
        quantity,
      },
    });
    expect(r.status()).toBe(400);
  }
  const priced = await page.request.post("/api/cart", {
    headers: { origin: "http://127.0.0.1:4391" },
    data: {
      action: "add",
      variantId: "gid://shopify/ProductVariant/1",
      quantity: 1,
      price: 0,
      total: 0,
      note: "<script>window.xss=1</script>".repeat(100),
    },
  });
  expect(priced.status()).toBe(200);
  const body = await priced.json();
  expect(body.cart.subtotal.amount).toBe("60.00");
  expect(JSON.stringify(body)).not.toContain("<script>");
  expect(JSON.stringify(body)).not.toContain("fixture-secret");
  await context.addCookies([
    {
      name: "mm_cart",
      value: "corrupted",
      url: "http://127.0.0.1:4391",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your bag is empty." }),
  ).toBeVisible();
});
test("price changes force review before checkout; only validated Shopify URL returned", async ({
  page,
  request,
}) => {
  await add(page);
  await page.goto("/bag");
  await expect(page.locator(".totals")).toContainText("$30.00");
  await control(request, { price: "35.00" });
  await page.getByRole("button", { name: "Continue to checkout" }).click();
  await expect(page.getByRole("status")).toContainText("Your bag changed");
  await expect(page.locator(".totals")).toContainText("$35.00");
  const cart = await (await page.request.get("/api/cart")).json();
  const r = await page.request.post("/api/cart", {
    headers: { origin: "http://127.0.0.1:4391" },
    data: { action: "checkout", digest: cart.cart.digest },
  });
  expect(r.status()).toBe(200);
  expect((await r.json()).checkoutUrl).toBe(
    "https://fixture.myshopify.com/checkouts/test-only",
  );
});
test("stock changes, approval withdrawal and missing policies prevent checkout", async ({
  page,
  request,
}) => {
  await add(page);
  await page.goto("/bag");
  await expect(page.locator(".totals")).toContainText("$30.00");
  await expect(
    page.getByRole("button", { name: "Continue to checkout" }),
  ).toBeEnabled();
  await control(request, { stock: 0 });
  await page.getByRole("button", { name: "Continue to checkout" }).click();
  await expect(page.getByRole("status")).toContainText("no longer available");
  await expect(
    page.getByRole("button", { name: "Continue to checkout" }),
  ).toBeDisabled();
  await control(request, { stock: 10, missingPolicy: true });
  await page.reload();
  await page.getByRole("button", { name: "Continue to checkout" }).click();
  await expect(page.getByRole("status")).toContainText(
    "temporarily unavailable",
  );
  await control(request, { missingPolicy: false, unapprove: true });
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Continue to checkout" }),
  ).toBeDisabled();
});
test("expired bag, Shopify errors and offline browser recover honestly", async ({
  page,
  request,
  context,
}) => {
  await add(page);
  await control(request, { expire: true });
  await page.goto("/bag");
  await expect(
    page.getByRole("heading", { name: "Your bag is empty." }),
  ).toBeVisible();
  await add(page);
  await control(request, { rejectMutation: true });
  await page.goto("/bag");
  await page
    .getByRole("button", { name: "Increase Fixture Sunday Gift Set" })
    .click();
  await expect(page.getByRole("status")).toContainText("could not apply");
  await expect(page.locator(".totals")).toContainText("$30.00");
  await control(request, { fail: true });
  await page.reload();
  await expect(page.getByRole("status")).toContainText(
    "temporarily unavailable",
  );
  await control(request, { fail: false, rejectMutation: false });
  await page.getByRole("button", { name: "Reload bag" }).click();
  await expect(page.locator(".totals")).toContainText("$30.00");
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "Increase Fixture Sunday Gift Set" })
    .click();
  await expect(page.getByRole("status")).toContainText("could not confirm");
  await context.setOffline(false);
  await page.reload();
  await expect(page.locator(".totals")).toContainText("$30.00");
});
test("production build is closed without store setup, no fake products or checkout", async ({
  page,
}) => {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("http://127.0.0.1:4392");
    await expect(page.locator(".announcement")).toContainText(
      "Shopping is not open",
    );
    await expect(page.locator(".product-card")).toHaveCount(0);
    await noOverflow(page);
    await page
      .locator("img")
      .evaluateAll((imgs) =>
        Promise.all(
          imgs.map((img) =>
            img instanceof HTMLImageElement
              ? ((img.loading = "eager"), img.decode())
              : null,
          ),
        ),
      );
    await page.screenshot({
      path: `evidence/${viewport.name}-home-production-closed.png`,
      fullPage: true,
    });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  }
  const response = await page.request.post("http://127.0.0.1:4392/api/cart", {
    headers: { origin: "http://127.0.0.1:4392" },
    data: { action: "checkout" },
  });
  expect(response.status()).toBe(503);
  await page.goto("http://127.0.0.1:4392/build-a-gift");
  await expect(
    page.getByRole("heading", { name: "Custom gifting isn’t open yet." }),
  ).toBeVisible();
  const robots = await page.request.get("http://127.0.0.1:4392/robots.txt");
  expect(await robots.text()).toContain("Disallow: /");
  expect(
    await page.locator('meta[name="robots"]').getAttribute("content"),
  ).toContain("noindex");
});

test("gift finder uses the Shopify contract catalog and never falls back to concepts", async ({
  page,
  request,
}) => {
  await page.goto("/gifting?preference=sets&budget=100");
  expect(await page.locator(".product-card").count()).toBeGreaterThan(0);
  const hrefs = await page
    .locator(".product-photo")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")));
  expect(hrefs.every((href) => href?.startsWith("/products/fixture-"))).toBe(
    true,
  );
  expect(await page.locator('img[src^="/concepts/"]').count()).toBe(0);
  await page.goto("http://127.0.0.1:4392/gifting");
  await expect(page.locator(".product-card")).toHaveCount(0);
  expect(await page.locator('img[src^="/concepts/"]').count()).toBe(0);
});
