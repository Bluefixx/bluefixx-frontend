export type OnboardingStep =
  | "splash"
  | "intro"
  | "language"
  | "welcome"
  | "email-signin"
  | "create-account"
  | "phone-verify";

export interface IntroSlideData {
  id: number;
  tag: string;
  title: string;
  description: string;
  callout: string;
  image: string;
  imageAlt: string;
  statNumber: string;
  statLabel: string;
  badgeLabel: string;
}

export interface LanguageOption {
  id: string;
  name: string;
  isSuggested?: boolean;
}
