"use client";

declare global {
  interface Window {
    PaystackPop?: new () => {
      resumeTransaction: (
        accessCode: string,
        callbacks?: {
          onSuccess?: (transaction: { reference?: string }) => void;
          onCancel?: () => void;
          onError?: (error: { message?: string }) => void;
        }
      ) => void;
    };
  }
}

function loadPaystackInline(): Promise<NonNullable<Window["PaystackPop"]>> {
  if (typeof window !== "undefined" && window.PaystackPop) {
    return Promise.resolve(window.PaystackPop);
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.paystack.co/v2/inline.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () =>
        window.PaystackPop
          ? resolve(window.PaystackPop)
          : reject(new Error("Paystack Inline unavailable"))
      );
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Paystack Inline"))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.onload = () => {
      if (window.PaystackPop) resolve(window.PaystackPop);
      else reject(new Error("Paystack Inline unavailable"));
    };
    script.onerror = () => reject(new Error("Failed to load Paystack Inline"));
    document.head.appendChild(script);
  });
}

export async function openPaystackInline(options: {
  checkoutUrl: string;
  onSuccess: (reference?: string) => void | Promise<void>;
  onCancel?: () => void;
  onError?: (message: string) => void;
  onFallbackRedirect?: (checkoutUrl: string) => void;
}): Promise<void> {
  const accessCode = options.checkoutUrl.split("/").filter(Boolean).pop();

  try {
    if (!accessCode) throw new Error("Missing Paystack access code");
    const PaystackPop = await loadPaystackInline();
    const popup = new PaystackPop();
    popup.resumeTransaction(accessCode, {
      onSuccess: (txn) => {
        void options.onSuccess(txn?.reference);
      },
      onCancel: () => {
        options.onCancel?.();
      },
      onError: (err) => {
        options.onError?.(err?.message || "Paystack payment failed.");
      },
    });
  } catch {
    if (options.onFallbackRedirect) {
      options.onFallbackRedirect(options.checkoutUrl);
    } else if (typeof window !== "undefined") {
      window.location.href = options.checkoutUrl;
    }
  }
}
