import type { Metadata } from "next";
import ForgotPasswordPage from "@/features/onboarding/components/ForgotPasswordPage";

export const metadata: Metadata = {
  title: "Forgot Password | BlueFixx Marketplace",
  description: "Recover access to your BlueFixx account securely.",
};

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
