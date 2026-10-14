import type { Metadata } from "next";
import OnboardingFlow from "@/features/onboarding/components/OnboardingFlow";

export const metadata: Metadata = {
  title: "Onboarding | BlueFixx Marketplace",
  description:
    "Get started with BlueFixx. Discover verified artisans, book with confidence, and explore skill-building apprenticeship opportunities.",
};

export default function OnboardingPage() {
  return <OnboardingFlow initialStep="splash" />;
}
