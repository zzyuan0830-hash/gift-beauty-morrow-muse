import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: ["design.spec.ts", "gift-polish.spec.ts"],
  workers: 1,
  timeout: 90000,
  expect: { timeout: 12000 },
  reporter: [
    ["list"],
    ["json", { outputFile: "evidence/v5/static-browser-results.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4395",
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "python3 scripts/serve-showcase.py",
    url: "http://127.0.0.1:4395/",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
