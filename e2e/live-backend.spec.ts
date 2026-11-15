import { test, expect } from "@playwright/test";

test.describe("Live Backend Integration (no API mocks)", () => {
  test("1. /onboarding fetches real Google OAuth options from live backend (port 8000)", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    const authOptionsPromise = page.waitForResponse(
      (res) => res.url().includes("/api/v1/auth/options") && res.request().method() === "GET"
    );
    await page.getByRole("button", { name: "Skip introduction" }).click();

    const res = await authOptionsPromise;
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { google?: { enabled?: boolean; clientId?: string } };
    expect(body.google?.enabled).toBe(true);
    expect(Boolean(body.google?.clientId)).toBe(true);
  });

  test("2. /login hits real backend /api/v1/auth/login and surfaces real 401 error", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Enter your email address").fill("nonexistent-e2e@example.com");
    await page.getByPlaceholder("Enter your password").fill("Password123!");

    const loginPromise = page.waitForResponse(
      (res) => res.url().includes("/api/v1/auth/login") && res.request().method() === "POST"
    );
    await page.getByRole("button", { name: "Log In" }).click();

    const res = await loginPromise;
    expect(res.status()).toBe(401);
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });
});
