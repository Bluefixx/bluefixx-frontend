import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    headless: true,
    launchOptions: {
      executablePath:
        "/home/v2dent/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome",
    },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- -p 3000 -H 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 90_000,
  },
});
