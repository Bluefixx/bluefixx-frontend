# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: live-backend.spec.ts >> Live Backend Integration (no API mocks) >> 2. /login hits real backend /api/v1/auth/login and surfaces real 401 error
- Location: e2e/live-backend.spec.ts:20:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/login
Call log:
  - navigating to "http://127.0.0.1:3000/login", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e6]:
    - heading "This site can’t be reached" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - strong [ref=e9]: 127.0.0.1
      - text: refused to connect.
    - generic [ref=e10]:
      - paragraph [ref=e11]: "Try:"
      - list [ref=e12]:
        - listitem [ref=e13]: Checking the connection
        - listitem [ref=e14]:
          - link "Checking the proxy and the firewall" [ref=e15] [cursor=pointer]:
            - /url: "#buttons"
    - generic [ref=e16]: ERR_CONNECTION_REFUSED
  - generic [ref=e17]:
    - button "Reload" [ref=e19] [cursor=pointer]
    - button "Details" [ref=e20] [cursor=pointer]
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
  8  |     const authOptionsPromise = page.waitForResponse(
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
> 23 |     await page.goto("/login");
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/login
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