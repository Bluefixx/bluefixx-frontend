import { IntroSlideData, LanguageOption } from "../types";

export const INTRO_SLIDES: IntroSlideData[] = [
  {
    id: 1,
    tag: "CONFIDENCE STARTS WITH VERIFICATION",
    title: "Verified Artisans, Not Guesswork",
    description:
      "Every artisan passes identity checks and a competence assessment before they can take your job. You can see exactly what each badge means.",
    callout: "Clear profiles, protected agreements, and support when you need it.",
    image: "/images/customers.png",
    imageAlt: "Verified artisan shaking hands with customer outside modern home",
    statNumber: "100%",
    statLabel: "identity and competence checks before work begins",
    badgeLabel: "BLUEFIXX VERIFIED",
  },
  {
    id: 2,
    tag: "EVERYTHING AGREED IN ONE PLACE",
    title: "Book With Confidence.",
    description:
      "Send a quote request, negotiate labour, materials, warranty and timeline in one thread, then lock the agreed terms into your booking.",
    callout: "Clear profiles, protected agreements, and support when you need it.",
    image: "/images/workers.png",
    imageAlt: "Professional service artisan holding equipment beside service vehicle",
    statNumber: "1 thread",
    statLabel: "for quotes, materials, timeline, warranty and every agreed term",
    badgeLabel: "BLUEFIXX VERIFIED",
  },
  {
    id: 3,
    tag: "A PATHWAY INTO BETTER WORK",
    title: "Learn Skills. Build Careers. Earn More.",
    description:
      "Join an apprenticeship with a Master Artisan, earn certificates and apply for jobs — all in the same app.",
    callout: "Clear profiles, protected agreements, and support when you need it.",
    image: "/images/talents.png",
    imageAlt: "Master artisan mentoring young apprentice in carpentry workshop",
    statNumber: "One app",
    statLabel: "to learn with a Master Artisan, earn certificates and apply for jobs",
    badgeLabel: "BLUEFIXX VERIFIED",
  },
];

export const SUGGESTED_LANGUAGE: LanguageOption = {
  id: "en",
  name: "English",
  isSuggested: true,
};

export const OTHER_LANGUAGES: LanguageOption[] = [
  { id: "ig", name: "Igbo" },
  { id: "ha", name: "Hausa" },
  { id: "yo", name: "Yorùbá" },
  { id: "pcm", name: "Pidgin" },
];
