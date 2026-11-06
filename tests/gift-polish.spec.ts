import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
const kind = process.env.SHOWCASE_TEST === "1" ? "static" : "server";
for (const v of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`${v.name}: three gift stories, imagery and keyboard gallery`, async ({
    page,
  }) => {
    await page.setViewportSize(v);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    const audits = [];
    for (const [handle, name, count] of [
      ["the-slow-sunday", "The Slow Sunday", 3],
      ["the-little-thank-you", "The Little Thank You", 2],
      ["the-evening-edit", "The Evening Edit", 3],
    ] as const) {
      await page.goto(`/products/${handle}`);
      await expect(page.locator(".gift-item-list article")).toHaveCount(count);
      await expect(page.locator(".gallery .thumbnails button")).toHaveCount(2);
      await page.locator("img").evaluateAll((imgs) =>
        Promise.all(
          imgs.map((i) => {
            if (i instanceof HTMLImageElement) {
              i.loading = "eager";
              return i.decode();
            }
            return Promise.resolve();
          }),
        ),
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `evidence/v5/${kind}-${v.name}-${handle}-full.png`,
        fullPage: true,
        style: ".mobile-purchase{visibility:hidden!important}",
      });
      await page.screenshot({
        path: `evidence/v5/${kind}-${v.name}-${handle}-viewport.png`,
      });
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(scan.violations).toEqual([]);
      audits.push({ handle, violations: scan.violations });
      const main = page.locator(".gallery-main img");
      const original = await main.getAttribute("src");
      await page
        .getByRole("button", { name: "Show next product image" })
        .click();
      await expect(main).not.toHaveAttribute("src", original!);
      await page.getByRole("button", { name: `Enlarge ${name} image` }).click();
      await expect(
        page.getByRole("dialog", { name: `${name} image viewer` }),
      ).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => document.body.style.overflow))
        .toBe("hidden");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator(".gallery-controls")).toContainText("1 / 2");
      await page.keyboard.press("Escape");
      await expect(page.locator(".gallery-main")).toBeFocused();
      await expect
        .poll(() => page.evaluate(() => document.body.style.overflow))
        .not.toBe("hidden");
    }
    expect(errors).toEqual([]);
    await fs.writeFile(
      `evidence/v5/${kind}-${v.name}-gift-accessibility.json`,
      JSON.stringify(audits, null, 2),
    );
  });
}
test("mobile purchase visibility, bag count, menu focus, 320px and reduced motion", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products/the-little-thank-you");
  const cta = page.locator(".mobile-purchase");
  await expect(cta).toBeVisible();
  await cta.click();
  await expect(
    page.getByRole("spinbutton", { name: "Quantity" }),
  ).toBeFocused();
  await expect(cta).toHaveCount(0);
  await page.getByRole("spinbutton", { name: "Quantity" }).fill("2");
  await page.getByRole("button", { name: "Add to preview bag" }).click();
  await expect(page.locator(".added-feedback")).toContainText(
    "Preview bag updated",
  );
  await expect(page.locator(".header-actions > a")).toContainText("(2)");
  await page.locator(".added-feedback").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `evidence/v5/${kind}-mobile-add-feedback.png`,
  });
  const second = await context.newPage();
  await second.goto("/bag");
  await second
    .getByRole("button", { name: "Remove The Little Thank You" })
    .click();
  await expect(page.locator(".header-actions > a")).not.toContainText("(2)");
  await second.close();
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(cta).toHaveCount(0);
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog", { name: "Main menu" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("hidden");
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement?.closest("dialog")),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
  await page.setViewportSize({ width: 320, height: 740 });
  for (const path of [
    "/",
    "/shop",
    "/gifting",
    "/products/the-evening-edit",
    "/bag",
  ]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
