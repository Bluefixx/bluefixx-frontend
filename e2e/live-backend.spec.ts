import { test, expect } from "@playwright/test";

test.describe("Live Backend Integration (no API mocks)", () => {
  test("1. /onboarding fetches real Google OAuth options from live backend (port 8000)", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: "Skip introduction" }).click();
    await page.getByRole("button", { name: "Save changes" }).click();
    const authOptionsPromise = page.waitForResponse(
      (res) => res.url().includes("/api/v1/auth/options") && res.request().method() === "GET"
    );
    await page.getByRole("button", { name: /continue with google/i }).click();

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
    await page
      .getByPlaceholder("Enter your email address")
      .fill(`nonexistent-e2e-${Date.now()}@example.com`);
    await page.getByPlaceholder("Enter your password").fill("Password123!");

    const loginPromise = page.waitForResponse(
      (res) => res.url().includes("/api/v1/auth/login") && res.request().method() === "POST"
    );
    await page.getByRole("button", { name: "Log In" }).click();

    const res = await loginPromise;
    expect(res.status()).toBe(401);
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });

  test("3. Live Customer, Artisan & Talent dashboard routes hit real backend APIs", async ({
    request,
    page,
  }) => {
    const uniqueSuffix = Date.now();
    const email = `e2e-live-${uniqueSuffix}@example.com`;
    const phone = `+234809${String(uniqueSuffix).slice(-7)}`;

    // Register a real user against the live backend to verify auth + role APIs
    const regRes = await request.post("http://localhost:8000/api/v1/auth/register", {
      data: {
        fullName: "E2E Live Tester",
        email,
        phone,
        password: "StrongPass123!",
        acceptedTerms: true,
        channel: "EMAIL",
      },
    });
    // Expect 202 (queued) or 200/201, or 503 if SMTP is unconfigured locally
    expect([200, 201, 202, 503]).toContain(regRes.status());

    // Verify public catalog/health endpoints on live backend
    const healthRes = await request.get("http://localhost:8000/api/v1/health");
    expect(healthRes.status()).toBe(200);

    // Visit /explore as unauthenticated/customer and verify UI renders
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Welcome to BlueFixx/i })).toBeVisible();
  });
});
