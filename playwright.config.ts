import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "storefront.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: [
    ["list"],
    ["json", { outputFile: "evidence/v5/shopify-browser-results.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4391",
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "npx tsx tests/fixture-server.ts",
      url: "http://127.0.0.1:4399/health",
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --port 4391 --webpack",
      url: "http://127.0.0.1:4391/api/health",
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        E2E_FIXTURE: "1",
        SITE_URL: "http://127.0.0.1:4391",
        CART_COOKIE_SECRET: Buffer.alloc(32, 9).toString("base64"),
      },
    },
    {
      command: "npm start",
      url: "http://127.0.0.1:4392/api/health",
      reuseExistingServer: false,
      timeout: 60000,
      env: {
        PORT: "4392",
        HOSTNAME: "127.0.0.1",
        STORE_MODE: "maintenance",
        SITE_URL: "http://127.0.0.1:4392",
      },
    },
  ],
});
