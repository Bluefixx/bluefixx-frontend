import type { Metadata } from "next";
import OnboardingFlow from "@/features/onboarding/components/OnboardingFlow";

export const metadata: Metadata = {
  title: "BlueFixx | Trusted hands for every job",
  description:
    "BlueFixx connects verified professionals, customers, and apprentices in one unified marketplace. Find reliable services and skilled workers today.",
};

export default function Home() {
  return <OnboardingFlow />;
}
