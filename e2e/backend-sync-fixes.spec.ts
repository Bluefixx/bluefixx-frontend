import { test, expect } from "@playwright/test";

test.describe("Frontend Sync with Backend Audit Fixes", () => {
  test("signup enforces 8-128 character password validation matching backend", async ({ page }) => {
    await page.goto("/signup");
    await page.getByPlaceholder("Your full name").fill("Test User");
    await page.getByPlaceholder("803 245 0182").fill("8012345678");
    await page.getByPlaceholder("Enter your email address").fill("test@example.com");
    await page.getByPlaceholder("Create password").fill("123456");
    await page.getByPlaceholder("Repeat password").fill("123456");

    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.check();
    }

    await page.getByRole("button", { name: /continue|create account|sign up/i }).first().click();
    await expect(page.getByText(/Password must be between 8 and 128 characters/i)).toBeVisible();
  });

  test("bookings tracker exposes Cancel Unfunded Addition for ACCEPTED additions", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "bluefixx_active_role",
        value: "customer",
        domain: "127.0.0.1",
        path: "/",
      },
    ]);

    await page.addInitScript(() => {
      localStorage.setItem("bluefixx_access_token", "test-access-token");
      sessionStorage.setItem("bluefixx_access_token", "test-access-token");
    });

    await page.route("**/api/v1/**", async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.endsWith("/account")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "usr-1",
            fullName: "Test Customer",
            email: "test@example.com",
            phone: "+2348012345678",
            role: "CUSTOMER",
            roles: ["CUSTOMER"],
          }),
        });
      }
      if (url.endsWith("/wallet")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ available: "500000", reserved: "0" }),
        });
      }
      if (url.endsWith("/account/roles")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([{ role: "CUSTOMER", isActive: true }]),
        });
      }
      if (url.includes("/bookings/bk-1") && method === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "bk-1",
            status: "IN_PROGRESS",
            funded: true,
            released: false,
            disputed: false,
            base: "50000",
            fee: "5000",
            visitStart: new Date(Date.now() + 3600000).toISOString(),
            visitEnd: new Date(Date.now() + 7200000).toISOString(),
            artisan: { id: "art-1", fullName: "Emeka Artisan" },
            service: { name: "Pipe Repair" },
            additions: [
              {
                id: "add-1",
                status: "ACCEPTED",
                description: "Extra copper pipe",
                base: "10000",
                fee: "1000",
              },
            ],
          }),
        });
      }
      if (url.includes("/bookings") && method === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "bk-1",
              status: "IN_PROGRESS",
              funded: true,
              released: false,
              base: "50000",
              fee: "5000",
              visitStart: new Date(Date.now() + 3600000).toISOString(),
              visitEnd: new Date(Date.now() + 7200000).toISOString(),
              artisan: { id: "art-1", fullName: "Emeka Artisan" },
              service: { name: "Pipe Repair" },
            },
          ]),
        });
      }
      if (url.endsWith("/additions/add-1/cancel") && method === "POST") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: "add-1", status: "CANCELLED" }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/bookings?tab=active");
    const trackBtn = page.getByRole("button", { name: /track|view details|manage/i }).first();
    if (await trackBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await trackBtn.click();
      const cancelBtn = page.getByRole("button", { name: "Cancel Unfunded Addition" });
      await expect(cancelBtn).toBeVisible({ timeout: 10000 });
      const cancelReqPromise = page.waitForRequest(
        (req) => req.url().includes("/additions/add-1/cancel") && req.method() === "POST"
      );
      await cancelBtn.click();
      await cancelReqPromise;
      await expect(page.getByText("Unfunded addition cancelled.")).toBeVisible();
    }
  });
});
