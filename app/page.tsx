import React from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { APP_CONFIG } from "@/lib/constants";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Brand Header */}
        <header className="bg-white rounded-2xl p-8 border border-neutral-300 card-shadow-mobile flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Image
              src="/icons/logoMain.svg"
              alt="Bluefixx Logo"
              width={56}
              height={56}
              priority
              className="w-14 h-14 object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-h4 font-bold text-primary-900">{APP_CONFIG.name}</h1>
                <Badge variant="primary" size="small">Frontend Foundation</Badge>
              </div>
              <p className="text-b3 text-neutral-600 mt-1">{APP_CONFIG.tagline}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">Next.js 16 App Router</Badge>
            <Badge variant="secondary">Tailwind CSS v4 Tokens</Badge>
            <Badge variant="neutral">TypeScript Strict</Badge>
          </div>
        </header>

        {/* Featured Live Screen: Onboarding Flow */}
        <section className="bg-gradient-to-r from-primary-900 to-secondary-700 text-white rounded-2xl p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="small">Implemented Screen</Badge>
              <span className="text-xs text-white/80 font-medium uppercase tracking-wider">
                Figma Design Baseline
              </span>
            </div>
            <h2 className="text-h4 font-bold text-white">Onboarding Flow &amp; Language Selection</h2>
            <p className="text-b3 text-neutral-200">
              Interactive 5-screen onboarding sequence: Splash &amp; loading screen, 3-step value proposition carousel (Verified Artisans, Book with Confidence, Careers &amp; Skills), and localized Language Selection without flags.
            </p>
          </div>
          <Link href="/onboarding" className="shrink-0">
            <Button variant="white" size="large" className="font-bold shadow-lg">
              Launch Onboarding Flow &rarr;
            </Button>
          </Link>
        </section>

        {/* Foundation Overview Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader>
              <Badge variant="primary" className="w-fit mb-2">Design System</Badge>
              <CardTitle>Token Architecture</CardTitle>
              <CardDescription>
                Synchronized with Bluefixx design system specs. Primary (#001B40), secondary (#074292), neutral, accent, and semantic color scales.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card variant="default">
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">Component Library</Badge>
              <CardTitle>Accessible Primitives</CardTitle>
              <CardDescription>
                Reusable buttons, inputs, textareas, badges, cards, and feedback components ready for Figma composition.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card variant="default">
            <CardHeader>
              <Badge variant="success" className="w-fit mb-2">Ready for Figma</Badge>
              <CardTitle>Iterative Workflows</CardTitle>
              <CardDescription>
                Standardized implementation workflows, review checklists, and AI handoff protocols in <code className="text-c2 bg-neutral-200 px-1 py-0.5 rounded">docs/</code>.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* Component Showcase Preview */}
        <section className="bg-white rounded-2xl p-8 border border-neutral-300 card-shadow-mobile space-y-8">
          <div>
            <h2 className="text-h5 font-bold text-neutral-1000">Foundational Components Preview</h2>
            <p className="text-b3 text-neutral-600 mt-1">
              Live inspection of initialized tokens, variants, and responsive states.
            </p>
          </div>

          {/* Button Variants */}
          <div className="space-y-3">
            <h3 className="text-s2 font-semibold text-neutral-800">Button Variants</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="solid" size="medium">Solid Primary</Button>
              <Button variant="outlined" size="medium">Outlined Primary</Button>
              <Button variant="white" size="medium">White Surface</Button>
              <Button variant="solid" size="medium" disabled>Disabled</Button>
            </div>
          </div>

          {/* Button Sizes */}
          <div className="space-y-3">
            <h3 className="text-s2 font-semibold text-neutral-800">Button Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="giant">Giant (54px)</Button>
              <Button size="large">Large (44px)</Button>
              <Button size="medium">Medium (38px)</Button>
              <Button size="small">Small (32px)</Button>
              <Button size="tiny">Tiny (26px)</Button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="space-y-3">
            <h3 className="text-s2 font-semibold text-neutral-800">Status Badges</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="success">Verified / Success</Badge>
              <Badge variant="warning">In Progress / Warning</Badge>
              <Badge variant="error">Declined / Error</Badge>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <footer className="text-center text-c1 text-neutral-500 py-4">
          Bluefixx LLP &bull; Frontend Foundation &bull; Next.js 16 &bull; React 19 &bull; Tailwind CSS v4
        </footer>
      </div>
    </main>
  );
}
