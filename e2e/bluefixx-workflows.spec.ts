import { test, expect, Page, Route } from "@playwright/test";

const API_BASE = "**/api/v1/**";

function jsonResponse(route: Route, data: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(data),
  });
}

async function seedAuthenticatedSession(
  page: Page,
  role: "customer" | "artisan" | "apprentice" = "customer",
  userOverrides: Record<string, unknown> = {}
) {
  const user = {
    id: "usr-e2e-001",
    fullName: "Adaeze Okafor",
    email: "adaeze@example.com",
    phone: "+2348030001111",
    role,
    isVerified: true,
    ...userOverrides,
  };

  await page.addInitScript(
    ({ seededUser, seededRole }) => {
      localStorage.setItem("bluefixx_access_token", "e2e-jwt-access-token");
      sessionStorage.setItem("bluefixx_access_token", "e2e-jwt-access-token");
      localStorage.setItem("bluefixx_user", JSON.stringify(seededUser));
      localStorage.setItem("bluefixx_active_role", seededRole);
      document.cookie = `bluefixx_active_role=${seededRole}; path=/; max-age=604800; SameSite=Lax`;
    },
    { seededUser: user, seededRole: role }
  );

  await page.context().addCookies([
    {
      name: "bluefixx_active_role",
      value: role,
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
}

test.describe("Bluefixx E2E: OAuth, OTP Channel, Role Switching, Customer <-> Artisan", () => {
  test("1. Signup opens OTP channel selection modal and sends selected channel", async ({
    page,
  }) => {
    let registerPayload: Record<string, unknown> | null = null;

    await page.route(API_BASE, async (route) => {
      const url = route.request().url();
      if (url.includes("/auth/register") && route.request().method() === "POST") {
        registerPayload = route.request().postDataJSON() as Record<string, unknown>;
        return jsonResponse(route, {
          challengeId: "chl-e2e-email-1",
          channel: registerPayload?.otpChannel || "EMAIL",
          maskedTarget: "a***@example.com",
        });
      }
      return jsonResponse(route, {});
    });

    await page.goto("/signup");

    await page.getByPlaceholder("Your full name").fill("Adaeze Okafor");
    await page.getByPlaceholder("803 245 0182").fill("8032450182");
    await page.getByPlaceholder("Enter your email address").fill("adaeze@example.com");
    await page.getByPlaceholder("Create password").fill("StrongPass123!");
    await page.getByPlaceholder("Repeat password").fill("StrongPass123!");
    await page.locator("#termsCheckbox").check();

    await page.getByRole("button", { name: /create account|register/i }).click();

    // Verify OtpChannelModal opens
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Where should we send your code?")).toBeVisible();

    // Select Email option inside modal & confirm
    await modal.getByText("Email address").click();
    await modal.getByRole("button", { name: "Send code via Email" }).click();

    await expect.poll(() => registerPayload).not.toBeNull();
    expect(registerPayload?.["channel"]).toBe("EMAIL");
  });

  test("2. Google OAuth button connects and authenticates on /onboarding", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // Simulate Google GSI returning an ID token when prompt/button triggers
      (window as unknown as Record<string, unknown>).google = {
        accounts: {
          id: {
            initialize: (cfg: { callback: (res: { credential: string }) => void }) => {
              (window as unknown as Record<string, unknown>).__gsiCallback = cfg.callback;
            },
            prompt: () => {
              const cb = (window as unknown as Record<string, unknown>).__gsiCallback as
                | ((res: { credential: string }) => void)
                | undefined;
              cb?.({ credential: "e2e-google-id-token" });
            },
            renderButton: () => {},
          },
          oauth2: {
            initTokenClient: (cfg: { callback: (res: { access_token: string }) => void }) => ({
              requestAccessToken: () => cfg.callback({ access_token: "e2e-google-access-token" }),
            }),
          },
        },
      };
    });

    let googleAuthCalled = false;

    await page.route(API_BASE, async (route) => {
      const url = route.request().url();
      if (url.includes("/auth/options")) {
        return jsonResponse(route, {
          providers: {
            google: { enabled: true, clientId: "e2e-google-client-id" },
          },
        });
      }
      if (url.includes("/auth/google") && route.request().method() === "POST") {
        googleAuthCalled = true;
        return jsonResponse(route, {
          accessToken: "e2e-google-jwt",
          user: {
            id: "usr-google-1",
            fullName: "Google Tester",
            email: "google@example.com",
            phone: "+2348091112222",
            role: "CUSTOMER",
            isVerified: true,
          },
        });
      }
      if (url.includes("/accounts/me")) {
        return jsonResponse(route, {
          user: {
            id: "usr-google-1",
            fullName: "Google Tester",
            email: "google@example.com",
            phone: "+2348091112222",
            role: "CUSTOMER",
          },
          roles: ["CUSTOMER"],
          activeRole: "CUSTOMER",
        });
      }
      return jsonResponse(route, {});
    });

    await page.goto("/onboarding");
    await page.getByRole("button", { name: "Skip introduction" }).click();
    await page.getByRole("button", { name: "Save changes" }).click();
    const googleBtn = page.getByRole("button", { name: /continue with google/i });
    await expect(googleBtn).toBeVisible();
    await googleBtn.click();

    await expect.poll(() => googleAuthCalled, { timeout: 8000 }).toBeTruthy();
  });

  test("3. Role switching triggers first-time Artisan & Talent onboarding and real identity upload", async ({
    page,
  }) => {
    const switchRequests: Array<{ targetRole: string }> = [];
    let identitySubmitPayload: Record<string, unknown> | null = null;

    await seedAuthenticatedSession(page, "customer");

    await page.route(API_BASE, async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes("/accounts/me")) {
        return jsonResponse(route, {
          user: {
            id: "usr-e2e-001",
            fullName: "Adaeze Okafor",
            email: "adaeze@example.com",
            phone: "+2348030001111",
            role: "CUSTOMER",
          },
          roles: ["CUSTOMER"],
          activeRole: "CUSTOMER",
          roleOnboarding: {
            CUSTOMER: { completed: true, approval: "APPROVED" },
            ARTISAN: { completed: false, approval: "DRAFT" },
            LEARNER: { completed: false, profileComplete: false },
          },
        });
      }

      if (url.includes("/account/roles") && method === "GET") {
        return jsonResponse(route, [
          { role: "CUSTOMER", active: true, onboarding: { required: false, completed: true } },
          { role: "ARTISAN", active: false, onboarding: { required: true, completed: false } },
          { role: "LEARNER", active: false, onboarding: { required: true, completed: false } },
        ]);
      }

      if (url.includes("/account/roles") && method === "POST") {
        const body = route.request().postDataJSON() as { role: string };
        return jsonResponse(route, {
          activeRole: body.role,
          roles: ["CUSTOMER", body.role],
          onboarding: { required: true, completed: false },
        });
      }

      if (url.includes("/account/active-role") && method === "PATCH") {
        const body = route.request().postDataJSON() as { role: string };
        switchRequests.push({ targetRole: body.role });
        if (body.role === "ARTISAN") {
          return jsonResponse(route, {
            activeRole: "ARTISAN",
            roles: ["CUSTOMER", "ARTISAN"],
            onboarding: { required: true, completed: false },
          });
        }
        if (body.role === "LEARNER") {
          return jsonResponse(route, {
            activeRole: "LEARNER",
            roles: ["CUSTOMER", "LEARNER"],
            onboarding: { required: true, completed: false },
          });
        }
        return jsonResponse(route, {
          activeRole: "CUSTOMER",
          roles: ["CUSTOMER"],
          onboarding: { required: false, completed: true },
        });
      }

      if (url.includes("/artisan/identity") && method === "POST") {
        identitySubmitPayload = route.request().postDataJSON() as Record<string, unknown>;
        return jsonResponse(route, { message: "Identity submitted" });
      }

      if (url.includes("/artisan/onboarding") && method === "GET") {
        return jsonResponse(route, { approval: "DRAFT", draft: {} });
      }

      if (url.includes("/artisan/onboarding") && method === "PATCH") {
        return jsonResponse(route, { ok: true });
      }

      if (url.endsWith("/media") && method === "POST") {
        return jsonResponse(route, {
          id: `media-real-${Date.now()}`,
          uploadUrl: "http://127.0.0.1:3000/mock-s3-upload",
          fields: {},
        });
      }

      if (url.includes("/media/") && url.endsWith("/complete") && method === "POST") {
        return jsonResponse(route, { ok: true });
      }

      if (url.includes("/media/") && url.endsWith("/url") && method === "GET") {
        return jsonResponse(route, { url: "/images/workers.png" });
      }

      if (url.includes("/services")) {
        return jsonResponse(route, [
          { id: "srv-1", name: "Plumbing", slug: "plumbing" },
          { id: "srv-2", name: "Electrical", slug: "electrical" },
        ]);
      }

      if (url.includes("/artisan/dashboard")) {
        return jsonResponse(route, {
          profile: {
            businessName: "Adaeze Fixes",
            available: true,
            approval: "DRAFT",
            ratingCount: 0,
            ratingTotal: 0,
          },
          capabilities: {
            canBrowse: false,
            canQuote: false,
            canToggleAvailability: false,
          },
        });
      }

      if (url.includes("/customer/dashboard") || url.includes("/marketplace/dashboard")) {
        return jsonResponse(route, { categories: [], trustedArtisans: [], recentJobs: [] });
      }

      if (url.includes("/wallet")) {
        return jsonResponse(route, {
          currency: "NGN",
          available: "0",
          withdrawalReserved: "0",
          bookingHeld: "0",
        });
      }

      return jsonResponse(route, {});
    });

    await page.route("**/mock-s3-upload**", (route) =>
      route.fulfill({ status: 200, body: "" })
    );

    await page.goto("/dashboard");
    await page
      .getByTitle("Switch account view (Customer / Artisan / Talent)")
      .click();
    await page.getByRole("button", { name: "Switch to Artisan" }).click();

    await page.waitForURL("**/artisan?view=verification");
    expect(switchRequests.some((r) => r.targetRole === "ARTISAN")).toBeTruthy();

    // Artisan Onboarding Step 1 -> Step 2 (Identity)
    await expect(page.getByText(/Basic details|Identity check|Become an Artisan/i).first()).toBeVisible();
    const continueBtn = page.getByRole("button", { name: /continue|next/i }).first();
    if (await page.getByPlaceholder(/full name/i).isVisible().catch(() => false)) {
      await page.getByPlaceholder(/full name/i).fill("Adaeze Okafor");
    }
    if (await page.getByPlaceholder(/phone/i).isVisible().catch(() => false)) {
      await page.getByPlaceholder(/phone/i).fill("08030001111");
    }
    if (await page.locator("textarea").first().isVisible().catch(() => false)) {
      await page.locator("textarea").first().fill("Experienced residential plumber.");
    }
    await continueBtn.click();

    // Verify Step 2 identity upload uses real uploaded media IDs (no mock-gov-id-uuid)
    const ninInput = page.locator('input[placeholder*="11"], input[maxlength="11"]').first();
    if (await ninInput.isVisible().catch(() => false)) {
      await ninInput.fill("12345678901");
      const fileInputs = page.locator('input[type="file"]');
      const count = await fileInputs.count();
      if (count >= 2) {
        await fileInputs.nth(0).setInputFiles({
          name: "gov-id.png",
          mimeType: "image/png",
          buffer: Buffer.from("fake-png-bytes"),
        });
        await fileInputs.nth(1).setInputFiles({
          name: "selfie.png",
          mimeType: "image/png",
          buffer: Buffer.from("fake-png-bytes"),
        });
        await page.getByRole("button", { name: /continue|next/i }).first().click();
        await expect.poll(() => identitySubmitPayload).not.toBeNull();
        const payload = identitySubmitPayload as Record<string, unknown> | null;
        const sentMediaIds = Array.isArray(payload?.mediaIds)
          ? (payload.mediaIds as string[])
          : [];
        expect(sentMediaIds.length).toBe(2);
        expect(sentMediaIds.join(",")).not.toContain("mock-");
      }
    }
  });

  test("4. Artisan workflow: Jobs List, Quote Sent & Withdraw, Active Job Detail & Review use real IDs", async ({
    page,
  }) => {
    const withdrawnOfferIds: string[] = [];
    const postedUpdateBookingIds: string[] = [];
    const reviewedBookingIds: string[] = [];

    await seedAuthenticatedSession(page, "artisan");

    await page.route(API_BASE, async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes("/accounts/me")) {
        return jsonResponse(route, {
          user: {
            id: "usr-art-1",
            fullName: "Chidi Artisan",
            email: "chidi@example.com",
            phone: "+2348021112222",
            role: "ARTISAN",
          },
          roles: ["CUSTOMER", "ARTISAN"],
          activeRole: "ARTISAN",
          roleOnboarding: {
            ARTISAN: { completed: true, approval: "APPROVED" },
          },
        });
      }

      if (url.includes("/artisan/dashboard")) {
        return jsonResponse(route, {
          profile: {
            businessName: "Chidi Plumbing",
            available: true,
            approval: "APPROVED",
            ratingCount: 12,
            ratingTotal: 58,
          },
          capabilities: {
            canBrowse: true,
            canQuote: true,
            canToggleAvailability: true,
          },
        });
      }

      if (url.includes("/artisan/requests") && url.includes("tab=incoming")) {
        return jsonResponse(route, {
          items: [
            {
              id: "req-real-901",
              jobId: "job-real-901",
              title: "Fix Kitchen Pipe Leak",
              serviceName: "Plumbing",
              customer: { id: "cust-1", displayName: "Tunde Bakare" },
              budget: "4500000",
              area: "Lekki Phase 1",
              status: "OPEN",
              createdAt: new Date().toISOString(),
            },
          ],
          nextCursor: null,
        });
      }

      if (url.includes("/artisan/requests") && url.includes("tab=declined")) {
        return jsonResponse(route, { items: [], nextCursor: null });
      }

      if (url.match(/\/bookings\?.*view=artisan.*tab=active/)) {
        return jsonResponse(route, [
          {
            id: "bkg-real-777",
            quoteId: "qt-real-777",
            offerId: "off-real-777",
            customerId: "cust-1",
            artisanId: "usr-art-1",
            customer: { id: "cust-1", fullName: "Tunde Bakare" },
            base: "6000000",
            fee: "420000",
            status: "IN_PROGRESS",
            funded: true,
            released: false,
            disputed: false,
            visitStart: new Date().toISOString(),
            visitEnd: new Date().toISOString(),
            jobTitle: "AC Compressor Repair",
            jobDescription: "Inspect and replace faulty capacitor.",
            address: { street: "12 Admiralty Way", city: "Lekki" },
          },
        ]);
      }

      if (url.match(/\/bookings\?.*view=artisan.*tab=completed/)) {
        return jsonResponse(route, [
          {
            id: "bkg-done-888",
            quoteId: "qt-done-888",
            offerId: "off-done-888",
            customerId: "cust-2",
            artisanId: "usr-art-1",
            customer: { id: "cust-2", fullName: "Ngozi Eze" },
            base: "3500000",
            fee: "245000",
            status: "COMPLETED",
            funded: true,
            released: true,
            disputed: false,
            visitStart: new Date().toISOString(),
            visitEnd: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            jobTitle: "Bathroom Tap Replacement",
          },
        ]);
      }

      if (url.includes("/artisan/customer-reviews")) {
        return jsonResponse(route, [{ bookingId: "bkg-done-888" }]);
      }

      if (url.includes("/jobs/job-real-901/conversation") && method === "POST") {
        return jsonResponse(route, { quoteId: "qt-real-901", status: "OPEN", isNew: true });
      }

      if (url.includes("/quotes/qt-real-901/offers") && method === "POST") {
        return jsonResponse(route, {
          id: "off-real-901",
          quoteId: "qt-real-901",
          authorId: "usr-art-1",
          version: 1,
          labour: "3000000",
          materials: [],
          base: "4500000",
          fee: "315000",
          status: "OPEN",
        });
      }

      if (url.includes("/offers/") && url.includes("/withdraw") && method === "POST") {
        const match = url.match(/\/offers\/([^/]+)\/withdraw/);
        if (match) withdrawnOfferIds.push(match[1]);
        return jsonResponse(route, { ok: true });
      }

      if (url.includes("/bookings/bkg-real-777/updates") && method === "GET") {
        return jsonResponse(route, { items: [], nextCursor: null });
      }

      if (url.includes("/bookings/bkg-real-777/updates") && method === "POST") {
        postedUpdateBookingIds.push("bkg-real-777");
        return jsonResponse(route, {
          id: "upd-1",
          bookingId: "bkg-real-777",
          authorId: "usr-art-1",
          clientId: "cid-1",
          text: "Replaced capacitor",
          createdAt: new Date().toISOString(),
        });
      }

      if (url.includes("/bookings/bkg-real-777") && method === "GET") {
        return jsonResponse(route, {
          id: "bkg-real-777",
          quoteId: "qt-real-777",
          offerId: "off-real-777",
          customerId: "cust-1",
          artisanId: "usr-art-1",
          customer: { id: "cust-1", fullName: "Tunde Bakare" },
          base: "6000000",
          fee: "420000",
          status: "IN_PROGRESS",
          funded: true,
          released: false,
          disputed: false,
          visitStart: new Date().toISOString(),
          visitEnd: new Date().toISOString(),
          jobTitle: "AC Compressor Repair",
          jobDescription: "Inspect and replace faulty capacitor.",
          address: { street: "12 Admiralty Way", city: "Lekki" },
        });
      }

      if (url.includes("/bookings/") && url.includes("/customer-review") && method === "POST") {
        const match = url.match(/\/bookings\/([^/]+)\/customer-review/);
        if (match) reviewedBookingIds.push(match[1]);
        return jsonResponse(route, { ok: true });
      }

      return jsonResponse(route, {});
    });

    await page.goto("/artisan?view=requests");

    // Verify real request renders (and mock BFX-51029 does NOT exist)
    await expect(page.getByText("Fix Kitchen Pipe Leak")).toBeVisible();
    await expect(page.getByText("BFX-51029")).toHaveCount(0);

    // View request -> Send Quote -> Withdraw real offerId
    await page.getByRole("button", { name: "View request" }).click();
    await expect(page.getByText("Fix Kitchen Pipe Leak").first()).toBeVisible();
    await page.getByRole("button", { name: /send quote/i }).click();

    await expect(page.getByRole("heading", { name: "Quote Sent", exact: true })).toBeVisible();
    await page.getByRole("button", { name: /withdraw quote/i }).click();
    await page.getByRole("button", { name: "Withdraw Quote" }).last().click();

    await expect.poll(() => withdrawnOfferIds).toEqual(["off-real-901"]);
    expect(withdrawnOfferIds).not.toContain("mock-offer-id");

    // Navigate to Active Jobs -> Manage job -> Post update with real bookingId
    await page.goto("/artisan?view=active-jobs");
    await expect(page.getByText("AC Compressor Repair")).toBeVisible();
    await page.getByRole("button", { name: "Manage job" }).click();

    await expect(page.getByRole("heading", { name: "Tunde Bakare" })).toBeVisible();
    await page
      .getByPlaceholder("Post an update for the customer...")
      .fill("Replaced capacitor and tested cooling.");
    await page.getByRole("button", { name: "Post update" }).click();
    await expect.poll(() => postedUpdateBookingIds).toEqual(["bkg-real-777"]);

    // Navigate to Completed Jobs -> Rate Customer -> submit real bookingId
    await page.goto("/artisan?view=completed-jobs");
    await expect(page.getByText(/Bathroom Tap Replacement/)).toBeVisible();
    await page.getByRole("button", { name: "Rate Customer" }).click();
    await page.getByRole("button", { name: /submit review|submit rating/i }).click();

    await expect.poll(() => reviewedBookingIds).toEqual(["bkg-done-888"]);
    expect(reviewedBookingIds).not.toContain("mock-booking-uuid");
  });

  test("5. Customer workflow: Compare Quotes, Accept Offer, Escrow Payment, and Booking Tracker", async ({
    page,
  }) => {
    const acceptedOfferIds: string[] = [];
    const paymentPayloads: Array<Record<string, unknown>> = [];
    const confirmedBookingIds: string[] = [];

    await seedAuthenticatedSession(page, "customer");

    await page.route(API_BASE, async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes("/accounts/me")) {
        return jsonResponse(route, {
          user: {
            id: "usr-e2e-001",
            fullName: "Adaeze Okafor",
            email: "adaeze@example.com",
            phone: "+2348030001111",
            role: "CUSTOMER",
          },
          roles: ["CUSTOMER"],
          activeRole: "CUSTOMER",
        });
      }

      if (url.includes("/jobs") && !url.includes("/jobs/") && method === "GET") {
        return jsonResponse(route, [
          {
            id: "job-cust-501",
            customerId: "usr-e2e-001",
            serviceId: "srv-1",
            title: "Bathroom Pipe Replacement",
            description: "Leaking pipe behind wash basin.",
            urgency: "WITHIN_TWO_DAYS",
            status: "OPEN",
            preferredStart: new Date().toISOString(),
            preferredEnd: new Date().toISOString(),
            quotesCount: 1,
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      if (url.includes("/jobs/job-cust-501") && method === "GET") {
        return jsonResponse(route, {
          id: "job-cust-501",
          title: "Bathroom Pipe Replacement",
          description: "Leaking pipe behind wash basin.",
          status: "OPEN",
        });
      }

      if (url.includes("/quotes") && method === "GET") {
        return jsonResponse(route, [
          {
            id: "qt-cust-501",
            customerId: "usr-e2e-001",
            artisanId: "art-501",
            serviceId: "srv-1",
            description: "Replace corroded PPR joint and test line.",
            urgency: "WITHIN_TWO_DAYS",
            address: {},
            preferredStart: new Date().toISOString(),
            preferredEnd: new Date().toISOString(),
            mediaIds: [],
            status: "OPEN",
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            offers: [
              {
                id: "off-cust-501",
                quoteId: "qt-cust-501",
                authorId: "art-501",
                version: 1,
                labour: "5000000",
                materials: [{ name: "PPR Pipe", amount: "2000000", supplier: "ARTISAN" }],
                base: "7000000",
                fee: "490000",
                warrantyMonths: 1,
                warrantyDays: 30,
                durationDays: 2,
                visitStart: new Date().toISOString(),
                visitEnd: new Date().toISOString(),
                status: "OPEN",
                expiresAt: new Date(Date.now() + 86400000).toISOString(),
              },
            ],
          },
        ]);
      }

      if (url.includes("/offers/") && url.includes("/accept") && method === "POST") {
        const match = url.match(/\/offers\/([^/]+)\/accept/);
        if (match) acceptedOfferIds.push(match[1]);
        return jsonResponse(route, { id: "bkg-cust-501" });
      }

      if (url.includes("/payments") && method === "POST") {
        paymentPayloads.push(route.request().postDataJSON() as Record<string, unknown>);
        return jsonResponse(route, {
          id: "pay-cust-501",
          reference: "TXN-E2E-501",
        });
      }

      if (url.includes("/bookings?") && method === "GET") {
        return jsonResponse(route, [
          {
            id: "bkg-cust-501",
            quoteId: "qt-cust-501",
            offerId: "off-cust-501",
            customerId: "usr-e2e-001",
            artisanId: "art-501",
            base: "7000000",
            fee: "490000",
            status: "WORK_SUBMITTED",
            funded: true,
            released: false,
            disputed: false,
            visitStart: new Date().toISOString(),
            visitEnd: new Date().toISOString(),
            completedAt: null,
          },
        ]);
      }

      if (url.includes("/bookings/") && url.includes("/schedule/confirm") && method === "POST") {
        paymentPayloads.push({ scheduleConfirmed: "bkg-cust-501" });
        return jsonResponse(route, { ok: true });
      }

      if (url.includes("/bookings/bkg-cust-501/confirm") && method === "POST") {
        confirmedBookingIds.push("bkg-cust-501");
        return jsonResponse(route, { ok: true });
      }

      if (url.includes("/bookings/bkg-cust-501") && method === "GET") {
        return jsonResponse(route, {
          id: "bkg-cust-501",
          quoteId: "qt-cust-501",
          offerId: "off-cust-501",
          customerId: "usr-e2e-001",
          artisanId: "art-501",
          artisan: { id: "art-501", fullName: "Chidi Artisan" },
          base: "7000000",
          fee: "490000",
          status: "WORK_SUBMITTED",
          funded: true,
          released: false,
          disputed: false,
          visitStart: new Date().toISOString(),
          visitEnd: new Date().toISOString(),
          completedAt: null,
        });
      }

      if (url.includes("/wallet")) {
        return jsonResponse(route, {
          currency: "NGN",
          available: "15000000",
          withdrawalReserved: "0",
          bookingHeld: "0",
        });
      }

      return jsonResponse(route, {});
    });

    await page.goto("/bookings?tab=job-posts");
    await expect(page.getByText("Bathroom Pipe Replacement").first()).toBeVisible();

    // 1. Compare Quotes & Accept Offer
    await page.getByRole("button", { name: "Compare all" }).click();
    await expect(page.getByText(/Artisan #ART-50|Chidi Artisan/).first()).toBeVisible();
    await page.getByRole("button", { name: "Accept", exact: true }).first().click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect.poll(() => acceptedOfferIds).toEqual(["off-cust-501"]);

    // 2. Proceed to Escrow Payment & Enter Transaction PIN
    await page.getByRole("button", { name: "Continue to Payment" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    const pinInputs = page.locator('input[inputmode="numeric"]');
    for (let i = 0; i < 4; i++) {
      await pinInputs.nth(i).fill(String(i + 1));
    }
    await page.getByRole("button", { name: "Continue to payment" }).click();
    await expect.poll(() => paymentPayloads.length).toBeGreaterThanOrEqual(1);

    // 3. Confirm Visit Schedule
    await page.getByRole("button", { name: "Continue to Schedule" }).click();
    await page.getByRole("button", { name: "Confirm Schedule" }).click();
    await expect
      .poll(() => paymentPayloads.some((p) => p["scheduleConfirmed"] === "bkg-cust-501"))
      .toBe(true);

    // 4. Active Booking Tracker -> Confirm Completion & Release Escrow
    await page.goto("/bookings");
    await page.getByRole("button", { name: /Active bookings/i }).click();
    await expect(page.getByRole("button", { name: /Track Progress/i }).first()).toBeVisible();
    await page.getByRole("button", { name: /Track Progress/i }).first().click();
    await page.getByRole("button", { name: "Confirm completion" }).click();
    if (await page.getByRole("heading", { name: "Is your job complete?" }).isVisible()) {
      await page.getByRole("button", { name: "Confirm completion" }).click();
    }
    await page.getByRole("button", { name: /confirm & release/i }).click();
    await expect.poll(() => confirmedBookingIds).toEqual(["bkg-cust-501"]);
  });

  test("6. Customer Post a Job wizard (/post-job) & Cancel Job (/bookings?tab=job-posts)", async ({
    page,
  }) => {
    let createdJobPayload: Record<string, unknown> | null = null;
    let cancelledJobReason: string | null = null;

    await seedAuthenticatedSession(page, "customer");

    await page.route("**/api/v1/**", async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes("/auth/me")) {
        return jsonResponse(route, {
          user: {
            id: "usr-e2e-001",
            fullName: "Adaeze Okafor",
            email: "adaeze@example.com",
            phone: "+2348000000001",
            role: "CUSTOMER",
          },
          roles: ["CUSTOMER"],
          activeRole: "CUSTOMER",
          roleOnboarding: {
            CUSTOMER: { completed: true, approval: "APPROVED" },
          },
        });
      }

      if (url.includes("/catalog")) {
        return jsonResponse(route, [
          {
            id: "cat-plumb",
            name: "Plumbing",
            slug: "plumbing",
            services: [
              {
                id: "srv-pipe-leak",
                name: "Leaking Pipe",
                slug: "leaking-pipe",
                startingPrice: "1500000",
                tasks: ["Fix kitchen sink leak", "Replace burst pipe"],
              },
            ],
          },
        ]);
      }

      if (url.includes("/addresses")) {
        return jsonResponse(route, [
          {
            id: "addr-cust-1",
            label: "Home",
            street: "14 Ogui Road",
            city: "Enugu",
            state: "Enugu",
            latitude: 6.4584,
            longitude: 7.5464,
            isDefault: true,
          },
        ]);
      }

      if (url.endsWith("/jobs") && method === "POST") {
        createdJobPayload = route.request().postDataJSON() as Record<string, unknown>;
        return jsonResponse(route, {
          id: "job-created-101",
          title: createdJobPayload["title"] || "Leaking Pipe - Fix kitchen sink leak",
          status: "OPEN",
        });
      }

      if (url.includes("/jobs/job-created-101/cancel") && method === "POST") {
        const body = route.request().postDataJSON() as { reason?: string };
        cancelledJobReason = body.reason || "cancelled";
        return jsonResponse(route, { message: "Job cancelled" });
      }

      if (url.includes("/jobs") && method === "GET") {
        return jsonResponse(route, [
          {
            id: "job-created-101",
            title: "Leaking Pipe - Fix kitchen sink leak",
            description: "Water dripping under kitchen sink.",
            status: "OPEN",
            urgency: "URGENT",
            budgetMinimum: "1500000",
            budgetMaximum: "2250000",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            matchedProfessionals: 3,
            quotes: [],
          },
        ]);
      }

      if (url.includes("/wallet")) {
        return jsonResponse(route, {
          currency: "NGN",
          available: "15000000",
          withdrawalReserved: "0",
          bookingHeld: "0",
        });
      }

      return jsonResponse(route, {});
    });

    await page.goto("/post-job");
    await expect(page.getByText("Leaking Pipe").first()).toBeVisible();
    await page.getByText("Leaking Pipe").first().click();
    await page.getByRole("button", { name: /continue/i }).first().click();

    // Step 2: Description
    await page
      .getByPlaceholder(/Water is dripping under the kitchen sink/i)
      .fill("Kitchen sink trap is leaking steadily.");
    await page.getByRole("button", { name: /continue/i }).first().click();

    // Step 3: Photos (skip)
    await page.getByRole("button", { name: /continue/i }).first().click();

    // Step 4: Budget
    await page.getByRole("button", { name: /continue/i }).first().click();

    // Step 5: Address
    await page.getByRole("button", { name: /continue/i }).first().click();

    // Step 6: Timing
    await page.getByRole("button", { name: /continue/i }).first().click();

    // Step 7: Review & Publish
    await page.getByRole("button", { name: /publish job|post job|confirm/i }).first().click();
    await expect.poll(() => createdJobPayload).not.toBeNull();
    expect(createdJobPayload?.["submit"]).toBe(true);
    expect(createdJobPayload?.["serviceId"]).toBe("srv-pipe-leak");

    // Cancel the posted job from /bookings?tab=job-posts
    await page.goto("/bookings?tab=job-posts");
    await expect(page.getByText("Leaking Pipe - Fix kitchen sink leak").first()).toBeVisible();
    await page.getByRole("button", { name: "Cancel Job" }).click();
    await page.getByRole("button", { name: "Cancel job", exact: true }).click();
    await expect.poll(() => cancelledJobReason).not.toBeNull();
  });

  test("7. Customer Explore (/explore), Messaging (/messages), and Reviews (/reviews)", async ({
    page,
  }) => {
    const sentMessages: string[] = [];
    const readQuoteIds: string[] = [];
    const reviewedBookings: string[] = [];

    await seedAuthenticatedSession(page, "customer");

    await page.route("**/api/v1/**", async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes("/auth/me")) {
        return jsonResponse(route, {
          user: {
            id: "usr-e2e-001",
            fullName: "Adaeze Okafor",
            email: "adaeze@example.com",
            phone: "+2348000000001",
            role: "CUSTOMER",
          },
          roles: ["CUSTOMER"],
          activeRole: "CUSTOMER",
          roleOnboarding: {
            CUSTOMER: { completed: true, approval: "APPROVED" },
          },
        });
      }

      if (url.includes("/catalog")) {
        return jsonResponse(route, [
          {
            id: "cat-plumb",
            categoryName: "Plumbing",
            name: "Plumbing",
            slug: "plumbing",
            trades: [
              { id: "srv-pipe-leak", name: "Leaking Pipe", slug: "leaking-pipe", startingPrice: "1500000" },
            ],
          },
        ]);
      }

      if (url.includes("/services")) {
        return jsonResponse(route, [{ id: "srv-1", name: "Plumbing", slug: "plumbing" }]);
      }

      if (url.includes("/artisans")) {
        return jsonResponse(route, [
          {
            id: "art-501",
            fullName: "Chidi Artisan",
            businessName: "Chidi Plumbing Works",
            rating: 4.9,
            reviewCount: 24,
            distanceKm: 1.8,
            verified: true,
          },
        ]);
      }

      if (url.includes("/conversations")) {
        return jsonResponse(route, [
          {
            id: "conv-1",
            quoteId: "qt-cust-501",
            participant: { id: "art-501", fullName: "Chidi Artisan" },
            jobTitle: "Bathroom Pipe Replacement",
            lastMessage: {
              id: "msg-0",
              text: "I can arrive at 9 AM tomorrow.",
              senderId: "art-501",
              createdAt: new Date().toISOString(),
            },
            unreadCount: 1,
          },
        ]);
      }

      if (url.includes("/quotes/qt-cust-501/messages") && method === "GET") {
        return jsonResponse(route, [
          {
            id: "msg-0",
            quoteId: "qt-cust-501",
            senderId: "art-501",
            text: "I can arrive at 9 AM tomorrow.",
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      if (url.includes("/quotes/qt-cust-501/messages") && method === "POST") {
        const body = route.request().postDataJSON() as { text?: string };
        if (body.text) sentMessages.push(body.text);
        return jsonResponse(route, {
          id: "msg-1",
          quoteId: "qt-cust-501",
          senderId: "usr-e2e-001",
          text: body.text || "",
          createdAt: new Date().toISOString(),
        });
      }

      if (url.includes("/quotes/qt-cust-501/read") && method === "POST") {
        readQuoteIds.push("qt-cust-501");
        return jsonResponse(route, { id: "qt-cust-501", readAt: new Date().toISOString() });
      }

      if (url.includes("/bookings?") && method === "GET") {
        return jsonResponse(route, [
          {
            id: "bkg-cust-501",
            quoteId: "qt-cust-501",
            offerId: "off-cust-501",
            customerId: "usr-e2e-001",
            artisanId: "art-501",
            artisan: { id: "art-501", fullName: "Chidi Artisan" },
            base: "7000000",
            fee: "490000",
            status: "COMPLETED",
            funded: true,
            released: true,
            disputed: false,
            visitStart: new Date().toISOString(),
            visitEnd: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            jobTitle: "Bathroom Pipe Replacement",
          },
        ]);
      }

      if (url.includes("/reviews") && method === "GET") {
        return jsonResponse(route, []);
      }

      if (url.includes("/bookings/bkg-cust-501/review") && method === "POST") {
        reviewedBookings.push("bkg-cust-501");
        return jsonResponse(route, { ok: true });
      }

      if (url.includes("/wallet")) {
        return jsonResponse(route, {
          currency: "NGN",
          available: "15000000",
          withdrawalReserved: "0",
          bookingHeld: "0",
        });
      }

      return jsonResponse(route, {});
    });

    // 1. Explore page
    await page.goto("/explore");
    await expect(page.getByRole("heading", { name: "Browse services" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Plumbing/ })).toBeVisible();

    // 2. Messages page
    await page.goto("/messages");
    await expect(page.getByText("I can arrive at 9 AM tomorrow.").first()).toBeVisible();
    await page.getByPlaceholder("Write a message...").fill("Please bring a spare 1-inch elbow joint.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect.poll(() => sentMessages).toContain("Please bring a spare 1-inch elbow joint.");
    await expect.poll(() => readQuoteIds).toContain("qt-cust-501");

    // 3. Reviews page
    await page.goto("/reviews");
    await expect(page.getByText("Bathroom Pipe Replacement").first()).toBeVisible();
    const rateBtn = page.getByRole("button", { name: /leave a review/i }).first();
    await rateBtn.click();
    await page
      .getByPlaceholder("He found the leak quickly and cleaned up after.")
      .fill("Chidi arrived on time and fixed the leak cleanly.");
    await page.getByRole("button", { name: "Submit review" }).click();
    await expect.poll(() => reviewedBookings).toEqual(["bkg-cust-501"]);
  });
});
