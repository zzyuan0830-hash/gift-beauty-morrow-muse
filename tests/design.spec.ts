import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
const key = "morrow-muse-design-bag-v3";
async function images(page: Page) {
  await page
    .locator("img")
    .evaluateAll((imgs) =>
      Promise.all(
        imgs.map((i) =>
          i instanceof HTMLImageElement
            ? ((i.loading = "eager"), i.decode())
            : null,
        ),
      ),
    );
  expect(
    await page
      .locator("img")
      .evaluateAll((imgs) =>
        imgs.every(
          (i) => !(i instanceof HTMLImageElement) || i.naturalWidth > 0,
        ),
      ),
  ).toBe(true);
}
for (const v of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
])
  test(`${v.name}: restored design and complete preview flow`, async ({
    page,
  }) => {
    await page.setViewportSize(v);
    const errors: string[] = [],
      external: string[] = [],
      api: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("request", (r) => {
      if (
        !r
          .url()
          .startsWith(
            process.env.SHOWCASE_TEST === "1"
              ? "http://127.0.0.1:4395"
              : "http://127.0.0.1:4393",
          )
      )
        external.push(r.url());
      if (r.url().includes("/api/cart")) api.push(r.url());
    });
    const audits = [];
    for (const [url, name] of [
      ["/", "home"],
      ["/shop", "collection"],
      ["/products/the-slow-sunday", "slow-sunday"],
      ["/products/fig-and-paper", "fig-and-paper"],
      ["/products/cloud-body-cream", "body-cream"],
      ["/gifting", "gifting"],
      ["/about", "about"],
    ]) {
      await page.goto(url);
      await images(page);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      audits.push({ url, violations: result.violations });
      expect(result.violations).toEqual([]);
      if (
        [
          "home",
          "collection",
          "slow-sunday",
          "fig-and-paper",
          "gifting",
          "about",
        ].includes(name)
      )
        await page.screenshot({
          path: `evidence/v5/${process.env.SHOWCASE_TEST === "1" ? "static" : "server"}-${v.name}-${name}.png`,
          fullPage: true,
          style: ".mobile-purchase{visibility:hidden!important}",
        });
      if (name === "home") {
        await expect(page.locator(".product-card")).toHaveCount(6);
        await page.screenshot({
          path: `evidence/v5/${process.env.SHOWCASE_TEST === "1" ? "static" : "server"}-${v.name}-hero.png`,
        });
        if (v.name === "desktop") {
          const box = await page.locator(".restored-hero").boundingBox();
          expect(box!.height).toBeLessThanOrEqual(620);
        }
      }
    }
    await page.goto("/products/the-slow-sunday");
    await page
      .getByRole("button", { name: "Enlarge The Slow Sunday image" })
      .click();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".gallery-controls")).toContainText("2 / 2");
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Enlarge The Slow Sunday image" }),
    ).toBeFocused();
    if (v.name === "mobile") {
      const menu = page.getByRole("button", { name: "Open menu" });
      await menu.click();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Escape");
      await expect(menu).toBeFocused();
    }
    await page.getByRole("spinbutton", { name: "Quantity" }).fill("2");
    await page.getByRole("button", { name: "Add to preview bag" }).click();
    await expect(page.getByRole("status")).toContainText("Preview bag updated");
    await page.goto("/products/fig-and-paper");
    await page.getByRole("button", { name: "Add to preview bag" }).click();
    await expect(page.getByRole("status")).toContainText("Preview bag updated");
    await page.getByRole("link", { name: "View your bag" }).click();
    await expect(page.locator(".totals")).toContainText("$210.00");
    await images(page);
    await page.screenshot({
      path: `evidence/v5/${process.env.SHOWCASE_TEST === "1" ? "static" : "server"}-${v.name}-bag.png`,
      fullPage: true,
      style: ".mobile-purchase{visibility:hidden!important}",
    });
    const a = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(a.violations).toEqual([]);
    audits.push({ url: "/bag", violations: a.violations });
    await page.getByRole("button", { name: "About this preview" }).click();
    await expect(page.getByRole("status")).toContainText("no order is created");
    await page.reload();
    await expect(page.locator(".totals")).toContainText("$210.00");
    await page
      .getByRole("button", { name: "Increase The Slow Sunday" })
      .click();
    await expect(page.locator(".totals")).toContainText("$288.00");
    await page
      .getByRole("button", { name: "Decrease The Slow Sunday" })
      .click();
    await expect(page.locator(".totals")).toContainText("$210.00");
    await page.getByRole("button", { name: "Remove Fig & Paper" }).click();
    await expect(page.locator(".totals")).toContainText("$156.00");
    await page.getByRole("button", { name: "Remove The Slow Sunday" }).click();
    await expect(
      page.getByRole("heading", { name: "Your bag is empty." }),
    ).toBeVisible();
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
    expect(api).toEqual([]);
    await fs.writeFile(
      `evidence/v5/${process.env.SHOWCASE_TEST === "1" ? "static" : "server"}-${v.name}-accessibility.json`,
      JSON.stringify(audits, null, 2),
    );
  });
test("preview filters, invalid routes, damaged storage and server-side checkout prohibition", async ({
  page,
}) => {
  await page.goto("/shop");
  await expect(page.locator(".product-card")).toHaveCount(9);
  await page
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption("fragrance");
  await page
    .getByRole("combobox", { name: "Sort by" })
    .selectOption("price-desc");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.locator(".product-card")).toHaveCount(3);
  await expect(page.locator(".product-card").first()).toContainText(
    "Amber Hour",
  );
  await page.getByRole("searchbox", { name: "Search" }).fill("nothing-here");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(
    page.getByRole("heading", { name: "No matching finds." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Reset filters" }).click();
  await expect(page.locator(".product-card")).toHaveCount(9);
  await page.evaluate((k) => localStorage.setItem(k, "null"), key);
  await page.goto("/bag");
  await expect(page.getByRole("status")).toContainText("reset");
  await expect(
    page.getByRole("heading", { name: "Your bag is empty." }),
  ).toBeVisible();
  const r = await page.request.post("/api/cart", {
    data: { action: "add", variantId: "concept-variant-1", quantity: 1 },
    headers: {
      Origin:
        process.env.SHOWCASE_TEST === "1"
          ? "http://127.0.0.1:4395"
          : "http://127.0.0.1:4393",
    },
  });
  if (process.env.SHOWCASE_TEST === "1") expect(r.status()).toBe(404);
  else {
    expect(r.status()).toBe(403);
    expect((await r.json()).error).toBe("DESIGN_ONLY");
  }
  await page.goto("/products/does-not-exist");
  await expect(
    page.getByRole("heading", { name: "We couldn’t find that page." }),
  ).toBeVisible();
  expect(
    await page.locator("meta[name=robots]").first().getAttribute("content"),
  ).toContain("noindex");
});
test("blocked browser storage keeps in-page preview usable with an honest warning", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Denied", "SecurityError");
      },
    }),
  );
  await page.goto("/products/the-little-thank-you");
  await page.getByRole("button", { name: "Add to preview bag" }).click();
  await expect(page.getByRole("status")).toContainText("page session");
  await page.getByRole("link", { name: "View your bag" }).click();
  await expect(page.locator(".totals")).toContainText("$48.00");
  await expect(page.getByRole("status")).toContainText("page session");
});

for (const viewport of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
]) {
  test(`${viewport.name}: gift finder, complete content pages and concept boundaries`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/gifting");
    await page.getByLabel("Their kind of ritual").selectOption("sets");
    await page.getByLabel("Your budget").selectOption("50");
    await page.getByRole("button", { name: "Find a thoughtful gift" }).click();
    await expect(page.locator(".product-card")).toHaveCount(1);
    await expect(page.locator(".product-card")).toContainText(
      "The Little Thank You",
    );
    await page.reload();
    await expect(page.getByLabel("Their kind of ritual")).toHaveValue("sets");
    await expect(page.getByLabel("Your budget")).toHaveValue("50");
    await page.getByLabel("Their kind of ritual").selectOption("fragrance");
    await page.getByRole("button", { name: "Find a thoughtful gift" }).click();
    await expect(
      page.getByRole("heading", { name: "A little more room to explore." }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Reset choices" }).click();
    await expect(page.locator(".product-card")).toHaveCount(9);
    const audits = [];
    for (const path of [
      "/faq",
      "/policies/shipping",
      "/policies/returns",
      "/policies/privacy",
      "/policies/terms",
    ]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(scan.violations).toEqual([]);
      audits.push({ path, violations: scan.violations });
    }
    await fs.writeFile(
      `evidence/v5/${process.env.SHOWCASE_TEST === "1" ? "static" : "server"}-${viewport.name}-content-accessibility.json`,
      JSON.stringify(audits, null, 2),
    );
    await page.goto("/products/cloud-body-cream");
    await expect(page.locator('a[href^="/design-notes/"]')).toHaveCount(0);
    await page.getByRole("link", { name: "Find their kind of gift" }).click();
    await expect(page.locator("h1")).toContainText("Begin with them.");
    expect(errors).toEqual([]);
  });
}
test("every concept has a direct, refreshable page and working local images", async ({
  page,
}) => {
  await page.goto("/shop");
  const paths = await page
    .locator(".product-photo")
    .evaluateAll((links) => links.map((a) => a.getAttribute("href")!));
  expect(new Set(paths).size).toBe(9);
  for (const path of paths) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await images(page);
    await page.reload();
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add to preview bag" }),
    ).toBeVisible();
    expect(
      await page.locator('script[type="application/ld+json"]').count(),
    ).toBe(0);
  }
});
