import type { Metadata } from "next";
import SignupPage from "@/features/onboarding/components/SignupPage";

export const metadata: Metadata = {
  title: "Create Account | BlueFixx Marketplace",
  description:
    "Create your BlueFixx account to book trusted services, manage agreements, or grow your trade career.",
};

export default function Signup() {
  return <SignupPage />;
}
