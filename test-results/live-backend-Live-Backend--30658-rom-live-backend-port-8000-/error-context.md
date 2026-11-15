# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: live-backend.spec.ts >> Live Backend Integration (no API mocks) >> 1. /onboarding fetches real Google OAuth options from live backend (port 8000)
- Location: e2e/live-backend.spec.ts:4:3

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: page.waitForResponse: Test timeout of 45000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=f2e3]:
  - generic [ref=f2e6]:
    - heading "This site can’t be reached" [level=1] [ref=f2e7]
    - paragraph [ref=f2e8]:
      - strong [ref=f2e9]: 127.0.0.1
      - text: refused to connect.
    - generic [ref=f2e10]:
      - paragraph [ref=f2e11]: "Try:"
      - list [ref=f2e12]:
        - listitem [ref=f2e13]: Checking the connection
        - listitem [ref=f2e14]:
          - link "Checking the proxy and the firewall" [ref=f2e15] [cursor=pointer]:
            - /url: "#buttons"
    - generic [ref=f2e16]: ERR_CONNECTION_REFUSED
  - generic [ref=f2e17]:
    - button "Reload" [ref=f2e19] [cursor=pointer]
    - button "Details" [ref=f2e20] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Live Backend Integration (no API mocks)", () => {
  4  |   test("1. /onboarding fetches real Google OAuth options from live backend (port 8000)", async ({
  5  |     page,
  6  |   }) => {
  7  |     await page.goto("/onboarding");
> 8  |     const authOptionsPromise = page.waitForResponse(
     |                                     ^ Error: page.waitForResponse: Test timeout of 45000ms exceeded.
  9  |       (res) => res.url().includes("/api/v1/auth/options") && res.request().method() === "GET"
  10 |     );
  11 |     await page.getByRole("button", { name: "Skip introduction" }).click();
  12 | 
  13 |     const res = await authOptionsPromise;
  14 |     expect(res.status()).toBe(200);
  15 |     const body = (await res.json()) as { google?: { enabled?: boolean; clientId?: string } };
  16 |     expect(body.google?.enabled).toBe(true);
  17 |     expect(Boolean(body.google?.clientId)).toBe(true);
  18 |   });
  19 | 
  20 |   test("2. /login hits real backend /api/v1/auth/login and surfaces real 401 error", async ({
  21 |     page,
  22 |   }) => {
  23 |     await page.goto("/login");
  24 |     await page.getByPlaceholder("Enter your email address").fill("nonexistent-e2e@example.com");
  25 |     await page.getByPlaceholder("Enter your password").fill("Password123!");
  26 | 
  27 |     const loginPromise = page.waitForResponse(
  28 |       (res) => res.url().includes("/api/v1/auth/login") && res.request().method() === "POST"
  29 |     );
  30 |     await page.getByRole("button", { name: "Log In" }).click();
  31 | 
  32 |     const res = await loginPromise;
  33 |     expect(res.status()).toBe(401);
  34 |     await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  35 |   });
  36 | });
  37 | 
```