"use client";

import { Toaster } from "react-hot-toast";

/**
 * App-wide toast notification container.
 * Uses react-hot-toast with Bluefixx brand styling.
 */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0px 4px 20px 0px rgba(15, 23, 42, 0.1)",
          background: "#fff",
          color: "#0F1115",
        },
        success: {
          iconTheme: { primary: "#10B981", secondary: "#fff" },
          style: {
            border: "1px solid #D1FAE5",
          },
        },
        error: {
          iconTheme: { primary: "#EF4444", secondary: "#fff" },
          style: {
            border: "1px solid #FEE2E2",
          },
        },
      }}
    />
  );
}
