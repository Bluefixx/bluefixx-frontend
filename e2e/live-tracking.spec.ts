import { test, expect } from "@playwright/test";

test.describe("Live Customer & Artisan GPS Tracking (Real Backend)", () => {
  test("customer shares live GPS, artisan tracks & navigates, and arrival cleans up", async ({
    browser,
  }) => {
    test.setTimeout(300_000);
    const customerContext = await browser.newContext({
      permissions: ["geolocation"],
      geolocation: { latitude: 6.4495, longitude: 3.4745, accuracy: 10 },
    });
    const artisanContext = await browser.newContext({
      permissions: ["geolocation"],
      geolocation: { latitude: 6.435, longitude: 3.455, accuracy: 12 },
    });

    const customerPage = await customerContext.newPage();
    const artisanPage = await artisanContext.newPage();

    try {
      // 1. Artisan logs in first
      await artisanPage.goto("http://localhost:3000/login");
      await artisanPage.getByPlaceholder("Enter your email address").fill("samsonamosv2@gmail.com");
      await artisanPage.getByPlaceholder("Enter your password").fill("Chelsea24462!");
      await artisanPage.getByRole("button", { name: "Log In" }).click();
      await expect(artisanPage).not.toHaveURL(/\/login/, { timeout: 20_000 });

      // Open Active Jobs list -> click "Manage job"
      await artisanPage.waitForTimeout(1500);
      await artisanPage.getByRole("link", { name: "Active jobs" }).click();
      const manageJobBtn = artisanPage.getByRole("button", { name: /Manage job/i }).first();
      await expect(manageJobBtn).toBeVisible({ timeout: 90_000 });
      await manageJobBtn.click();

      await expect(artisanPage.getByText("Live Location Tracker")).toBeVisible({ timeout: 120_000 });
      const navLink = artisanPage.getByRole("link", { name: /Start Navigation/i });
      await expect(navLink).toBeVisible({ timeout: 10_000 });

      // Artisan clicks "I'm On The Way" (starts GPS stream)
      await artisanPage.getByRole("button", { name: /I'm On The Way/i }).click();
      await expect(artisanPage.getByRole("button", { name: /Mark as Arrived/i })).toBeVisible({
        timeout: 30_000,
      });
      await expect(artisanPage.getByText(/km away · ~\d+ min \(live traffic\)/i)).toBeVisible({
        timeout: 60_000,
      });

      // 2. Customer logs in & opens Active bookings
      await customerPage.goto("http://localhost:3000/login");
      await customerPage.getByPlaceholder("Enter your email address").fill("v2dent@gmail.com");
      await customerPage.getByPlaceholder("Enter your password").fill("Chelsea24462!");
      await customerPage.getByRole("button", { name: "Log In" }).click();
      await expect(customerPage).not.toHaveURL(/\/login/, { timeout: 20_000 });

      if (customerPage.url().includes("/artisan")) {
        await customerPage.getByRole("button", { name: /Switch account view/i }).click();
        await customerPage.getByText("Customer", { exact: true }).first().click();
        await expect(customerPage).toHaveURL(/\/dashboard/, { timeout: 20_000 });
      }
      await customerPage.getByRole("button", { name: "Bookings" }).click();
      await customerPage.getByRole("link", { name: "Active bookings" }).click();
      const trackBtn = customerPage.getByRole("button", { name: /Track Progress/i }).first();
      await expect(trackBtn).toBeVisible({ timeout: 120_000 });
      await trackBtn.click();

      await expect(customerPage.getByText("Live Location Tracker")).toBeVisible({ timeout: 60_000 });
      await expect(customerPage.getByText(/km away · ~\d+ min/i)).toBeVisible({ timeout: 30_000 });
      // Customer GPS auto-starts on mount
      await expect(customerPage.getByText("Customer Live GPS")).toBeVisible({ timeout: 45_000 });

      // 3. Verify Artisan receives Customer Live GPS & updated Google Maps link
      await expect(artisanPage.getByText("Customer Live GPS")).toBeVisible({ timeout: 30_000 });
      await expect(navLink).toHaveAttribute(
        "href",
        /https:\/\/www\.google\.com\/maps\/dir\/\?api=1.*&destination=6\.4495,3\.4745&travelmode=driving&dir_action=navigate/
      );

      // 4. Artisan marks as arrived -> tracking ends on both screens
      await artisanPage.getByRole("button", { name: /Mark as Arrived/i }).click();
      await expect(artisanPage.getByText("Live Location Tracker")).toBeHidden({ timeout: 45_000 });
      await expect(customerPage.getByText("Live Location Tracker")).toBeHidden({ timeout: 45_000 });
    } finally {
      await customerContext.close();
      await artisanContext.close();
    }
  });
});
