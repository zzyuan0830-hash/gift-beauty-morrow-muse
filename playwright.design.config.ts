import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: ["design.spec.ts", "gift-polish.spec.ts"],
  workers: 1,
  timeout: 90000,
  expect: { timeout: 12000 },
  reporter: [
    ["list"],
    ["json", { outputFile: "evidence/v5/server-browser-results.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4393",
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview:design",
    url: "http://127.0.0.1:4393/api/health",
    reuseExistingServer: false,
    timeout: 60000,
    env: { PORT: "4393", HOSTNAME: "127.0.0.1" },
  },
});
