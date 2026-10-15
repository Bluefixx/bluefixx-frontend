import type { Metadata } from "next";
import LoginPage from "@/features/onboarding/components/LoginPage";

export const metadata: Metadata = {
  title: "Log In | BlueFixx Marketplace",
  description:
    "Sign in to your BlueFixx account to manage bookings, messages, and access verified service professionals.",
};

export default function Login() {
  return <LoginPage />;
}
