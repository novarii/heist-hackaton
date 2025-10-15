# Landing Page Redesign - Implementation Guide

## Overview
This document provides a detailed refactoring guide to transform the current Heist Agents landing page (`app/(public)/landing/page.tsx`) to match the new Figma design spec. The new design features a dark, sophisticated aesthetic with chain imagery, dust particle effects, and a centered hero layout.

**Figma Reference**: `5lpxBwzsQHJYrxiBWNiddR` (Node: `5:14`)
**Target Branch**: `feature/new-landing`
**Current Implementation**: `app/(public)/landing/page.tsx`

---

## Design Analysis

### Visual Changes from Current to New Design

#### Current Design
- Clean, minimal layout with left-aligned content
- Standard zinc-based dark theme (zinc-950 background)
- Prominent feature cards in grid layout
- Traditional SaaS marketing layout with CTA section
- Simple gradient-less typography

#### New Design (Figma)
- **Brand Identity**: "Merak" branding (replacing "Heist Agents")
- **Background**: Rich brown gradient (#654310 → #1B1D21) with dust particle texture overlay
- **Hero Section**: Centered layout with dramatic typography
- **Chain Imagery**: Decorative chain links on left and right sides
- **Typography**: Large serif display font with gradient effect on "Intelligence"
- **Prompt Input**: Centered, glass-morphism card with "Random Agent" pill selector
- **Color Palette**:
  - Primary Orange 900: `#654310`
  - Neutrals 13: `#1B1D21`
  - Neutrals 2: `#FDFDFD`
  - Neutrals 4: `#F1F1F2`
  - Neutrals 6: `#C6C7C8`
  - Red-White Gradient: `linear-gradient(to right, #ff7676, #ffffff)`

---

## Implementation Plan

### Phase 1: Asset Preparation

#### 1.1 Download and Organize Design Assets
Download the following images from Figma API and place them in `public/landing/`:

```bash
# Create asset directory
mkdir -p public/landing

# Assets to download:
- dust.svg (background texture overlay)
- ellipse-18.svg (hero glow effect)
- chain-left.svg (left decorative chain)
- chain-right.svg (right decorative chain)
- ellipse-4.svg (small circular accent)
- arrow-chevron-down.svg (dropdown indicator)
```

**Asset URLs** (from Figma):
```typescript
const ASSET_URLS = {
  dust: "https://www.figma.com/api/mcp/asset/a6aaa862-3e46-4617-b7c5-8f94c77b72bf",
  ellipse18: "https://www.figma.com/api/mcp/asset/3873c30b-bd1f-448d-b883-c74bdcd78c3d",
  chainRight: "https://www.figma.com/api/mcp/asset/59e41b08-9412-4eb6-914e-751fce479f34",
  chainLeft: "https://www.figma.com/api/mcp/asset/c83f1a8c-1dfd-4446-be9d-3360c56f9953",
  ellipse4: "https://www.figma.com/api/mcp/asset/76860959-2f90-44f4-afd6-e31c0605d483",
  arrowDown: "https://www.figma.com/api/mcp/asset/82cf973b-b4a0-4126-a2aa-3646a4baac48"
};
```

#### 1.2 Install Required Fonts
The design uses **Saprona** and **Apple Garamond** fonts:

**Option A: Self-hosted fonts** (recommended)
```typescript
// app/layout.tsx
import localFont from "next/font/local";

const saprona = localFont({
  src: [
    {
      path: "../public/fonts/saprona-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/saprona-semibold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-saprona",
});

const appleGaramond = localFont({
  src: "../public/fonts/apple-garamond.woff2",
  variable: "--font-apple-garamond",
});

// Update body className
<body className={`${saprona.variable} ${appleGaramond.variable} ...`}>
```

**Option B: Web fonts**
Add to `app/layout.tsx`:
```typescript
import { Cormorant_Garamond } from "next/font/google";

const garamond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-garamond",
});
```

---

### Phase 2: Tailwind Configuration

#### 2.1 Extend Tailwind Config
Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: {
            900: "#654310",
          },
        },
        neutrals: {
          2: "#FDFDFD",
          4: "#F1F1F2",
          6: "#C6C7C8",
          13: "#1B1D21",
        },
      },
      fontFamily: {
        saprona: ["var(--font-saprona)", "sans-serif"],
        garamond: ["var(--font-garamond)", "var(--font-apple-garamond)", "serif"],
      },
      backgroundImage: {
        "red-white-gradient": "linear-gradient(to right, #ff7676, #ffffff)",
        "dust-pattern": "url('/landing/dust.png')",
      },
      backdropBlur: {
        "2.5": "2.5px",
      },
      textShadow: {
        "hero": "7px 7px 5px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [
    // Add text-shadow plugin
    require("tailwindcss-textshadow"),
  ],
};

export default config;
```

#### 2.2 Install Additional Dependencies
```bash
pnpm add tailwindcss-textshadow
```

---

### Phase 3: Component Refactoring

#### 3.1 Create New Header Component
Create `app/(public)/landing/_components/LandingHeader.tsx`:

```typescript
"use client";

import Link from "next/link";

export default function LandingHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-6 py-6 lg:px-12">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="font-saprona text-3xl font-semibold text-neutrals-4 transition hover:text-white"
        >
          Merak
        </Link>

        <ul className="flex items-center gap-8 font-saprona text-xl text-white">
          <li>
            <Link href="/marketplace" className="transition hover:text-neutrals-4">
              Marketplace
            </Link>
          </li>
          <li>
            <Link href="/about" className="transition hover:text-neutrals-4">
              About Us
            </Link>
          </li>
          <li>
            <Link href="/login" className="transition hover:text-neutrals-4">
              Log In
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
```

#### 3.2 Refactor PromptInput Component
Update `components/PromptInput.tsx` to match the new glass-morphism design:

```typescript
"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";

type PromptInputProps = {
  placeholder?: string;
  submitLabel?: string;
  defaultValue?: string;
  showAgentSelector?: boolean;
  onSubmit?: (value: string) => void | Promise<void>;
};

export default function PromptInput({
  placeholder = "Ask Merak to hire you your new accountant...",
  submitLabel,
  defaultValue = "",
  showAgentSelector = false,
  onSubmit,
}: PromptInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!value.trim() || !onSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(value.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mx-auto w-full max-w-3xl"
    >
      {/* Glass-morphism container */}
      <div className="backdrop-blur-[2.5px] rounded-[34px] border border-black bg-white/5 px-8 py-10 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.08)]">
        <div className="relative flex items-center gap-4">
          {/* Agent Icon */}
          <div className="relative size-8 shrink-0">
            <div className="absolute inset-[-26%] overflow-hidden rounded-full">
              <Image
                src="/landing/ellipse-4.svg"
                alt=""
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Dropdown Icon */}
          {showAgentSelector && (
            <button
              type="button"
              className="shrink-0"
              onClick={() => {/* Handle agent selector */}}
            >
              <Image
                src="/landing/arrow-chevron-down.svg"
                alt="Select agent"
                width={24}
                height={24}
                className="opacity-80 transition hover:opacity-100"
              />
            </button>
          )}

          {/* Text Input */}
          <input
            className="flex-1 bg-transparent font-saprona text-xl text-neutrals-6 placeholder:text-neutrals-6 focus:text-white focus:outline-none"
            placeholder={placeholder}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={isSubmitting}
          />

          {/* Random Agent Pill */}
          {showAgentSelector && (
            <div className="shrink-0 rounded-2xl border border-neutral-500 bg-[rgba(221,221,222,0.2)] px-4 py-1.5 shadow-[inset_1px_1px_2.1px_1px_rgba(255,255,255,0.25)]">
              <span className="font-saprona text-base text-neutrals-4">
                Random Agent
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Decorative chains */}
      <div className="pointer-events-none absolute -left-32 -top-16 size-80">
        <Image
          src="/landing/chain-left.svg"
          alt=""
          fill
          className="object-contain"
        />
      </div>
      <div className="pointer-events-none absolute -right-32 -top-16 size-80">
        <Image
          src="/landing/chain-right.svg"
          alt=""
          fill
          className="object-contain"
        />
      </div>
    </form>
  );
}
```

#### 3.3 Create Hero Section Component
Create `app/(public)/landing/_components/HeroSection.tsx`:

```typescript
export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-orange-900 to-neutrals-13" />

      {/* Dust texture overlays */}
      <div className="absolute inset-0">
        <div
          className="absolute left-0 right-0 top-[-266px] h-[1045px] rounded-[40px] bg-dust-pattern bg-cover blur-0"
          style={{ backgroundSize: "545.64px 408.65px" }}
        />
        <div
          className="absolute bottom-[-266px] left-0 right-0 h-[1045px] rounded-[40px] bg-dust-pattern bg-cover blur-0"
          style={{ backgroundSize: "545.64px 408.65px" }}
        />
      </div>

      {/* Glow effect */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[295px] -translate-x-1/2 translate-y-1/2">
        <div className="relative size-full">
          <div className="absolute inset-[-170%]">
            <Image
              src="/landing/ellipse-18.svg"
              alt=""
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Heading */}
        <h1 className="mb-8 font-garamond text-[95px] leading-none text-neutrals-2 text-shadow-hero">
          <span>Find your </span>
          <span className="bg-gradient-to-r from-[#ff7676] to-white bg-clip-text text-transparent">
            Intelligence
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mb-16 font-garamond text-[22px] leading-normal text-white">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
        </p>

        {/* Prompt Input */}
        <PromptInput showAgentSelector />
      </div>
    </section>
  );
}
```

#### 3.4 Create Bottom Section Component
Create `app/(public)/landing/_components/BottomSection.tsx`:

```typescript
export default function BottomSection() {
  return (
    <section className="relative">
      {/* Glass-morphism rounded container */}
      <div className="backdrop-blur-[10px] min-h-[769px] rounded-tl-[100px] rounded-tr-[100px] border-2 border-white bg-white/5 px-8 py-16 shadow-[inset_0px_5px_20.3px_6px_rgba(255,255,255,0.08)]">
        {/* This section can contain additional content like:
         * - Agent marketplace preview
         * - Feature highlights
         * - Testimonials
         * - CTA sections
         */}
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 font-saprona text-4xl font-semibold text-neutrals-2">
            Explore Intelligence Agents
          </h2>

          {/* Placeholder for agent cards or other content */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Agent cards will go here */}
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

### Phase 4: Main Page Refactoring

#### 4.1 Refactor `app/(public)/landing/page.tsx`

**BEFORE** (Current Implementation):
```typescript
import Link from "next/link";
import AgentCard from "components/AgentCard";
import PromptHero from "./_components/PromptHero";

const demoAgents = [
  {
    name: "Research Scout",
    summary: "Aggregates market signals and compiles a daily competitive brief.",
    status: "In beta",
  },
  // ... more agents
];

export default function LandingPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-16 lg:px-8">
      <section className="flex flex-col gap-8">
        <div className="space-y-6">
          <span className="inline-flex w-fit items-center rounded-full border border-zinc-700 px-3 py-1 text-xs uppercase tracking-wide text-zinc-300">
            Agents orchestrated with Supabase
          </span>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            Ship composable AI agents with production guardrails built in.
          </h1>
          <p className="max-w-2xl text-base text-zinc-300 md:text-lg">
            Spin up orchestrators, manage tool telemetry, and connect to your stack
            in minutes. Heist gives product teams the velocity of prototypes with
            the governance of enterprise platforms.
          </p>
        </div>
        <PromptHero />
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <span>No credit card required</span>
          <span>—</span>
          <span>Templates for RAG, support, and growth agents</span>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {demoAgents.map((agent) => (
          <AgentCard
            key={agent.name}
            name={agent.name}
            summary={agent.summary}
            status={agent.status}
          />
        ))}
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-sm">
        {/* CTA section */}
      </section>
    </div>
  );
}
```

**AFTER** (New Implementation):
```typescript
import LandingHeader from "./_components/LandingHeader";
import HeroSection from "./_components/HeroSection";
import BottomSection from "./_components/BottomSection";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <LandingHeader />

      {/* Hero Section with full-screen centered design */}
      <HeroSection />

      {/* Bottom Section with rounded glass-morphism container */}
      <BottomSection />
    </div>
  );
}
```

#### 4.2 Update Public Layout
Update `app/(public)/layout.tsx` to remove default padding:

```typescript
import type { ReactNode } from "react";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
```

---

### Phase 5: Global Styling Updates

#### 5.1 Update `app/globals.css`

```css
@config "../tailwind.config.ts";
@import "tailwindcss";

:root {
  color-scheme: dark;
  --font-saprona: "Saprona", sans-serif;
  --font-apple-garamond: "Apple Garamond", serif;
}

body {
  font-family: var(--font-saprona);
  background-color: #1B1D21;
  color: #F1F1F2;
  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

/* Gradient text utilities */
.text-gradient-red-white {
  background: linear-gradient(to right, #ff7676, #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

### Phase 6: Migration Steps

#### Step-by-Step Migration

**Step 1: Backup Current Implementation**
```bash
# Create backup
cp "app/(public)/landing/page.tsx" "app/(public)/landing/page.tsx.backup"
```

**Step 2: Download Assets**
```bash
# Create directories
mkdir -p public/landing
mkdir -p public/fonts

# Download assets using curl or browser
# Save to public/landing/
```

**Step 3: Install Dependencies**
```bash
pnpm add tailwindcss-textshadow
```

**Step 4: Update Tailwind Config**
- Apply changes from Section 2.1

**Step 5: Create New Components**
- Create `LandingHeader.tsx`
- Create `HeroSection.tsx`
- Create `BottomSection.tsx`
- Update `PromptInput.tsx`

**Step 6: Update Main Landing Page**
- Replace content in `app/(public)/landing/page.tsx`

**Step 7: Update Global Styles**
- Update `app/globals.css`
- Update `app/layout.tsx` with font configurations

**Step 8: Test & Iterate**
```bash
pnpm dev
# Open http://localhost:3000/landing
```

---

## Key Differences Summary

| Aspect | Current Design | New Design |
|--------|---------------|------------|
| **Layout** | Left-aligned, boxed content | Full-screen, centered hero |
| **Background** | Solid zinc-950 | Gradient (#654310 → #1B1D21) with dust texture |
| **Typography** | Sans-serif only | Serif display (Apple Garamond) + Sans-serif (Saprona) |
| **Branding** | "Heist Agents" | "Merak" |
| **Header** | No persistent header | Fixed header with nav links |
| **Hero Copy** | Multi-paragraph value prop | Short, dramatic tagline |
| **Prompt Input** | Standard form input | Glass-morphism card with agent selector |
| **Visual Effects** | Minimal | Chain imagery, glow effects, text gradients |
| **Color Palette** | Zinc scale | Brand orange + neutrals + gradients |

---

## Breaking Changes & Considerations

### 1. **Branding Change**
- All references to "Heist" must be updated to "Merak"
- Update metadata in `app/layout.tsx`
- Update environment variables if applicable
- Update documentation

### 2. **Component API Changes**
- `PromptInput` now requires `showAgentSelector` prop
- `PromptInput` removes `label` and `submitLabel` props (handled visually differently)
- Consider backward compatibility if component is used elsewhere

### 3. **Route Structure**
- Current implementation has agent cards on landing page
- New design moves these to bottom section or separate route
- Consider if `/agents` route needs updating

### 4. **Asset Management**
- New images add ~2-3MB to bundle
- Consider optimizing images with Next.js Image Optimization
- Use responsive images for mobile

### 5. **Accessibility**
- Ensure decorative images have `alt=""`
- Test keyboard navigation on new prompt input
- Verify color contrast ratios (gradient text may need fallback)

### 6. **Performance**
- Multiple backdrop-blur effects may impact performance on low-end devices
- Consider adding `will-change: backdrop-filter` for optimization
- Test on various devices and browsers

### 7. **Responsive Design**
- Figma design appears to be desktop-first (1440px)
- Need to create responsive breakpoints for:
  - Mobile (< 640px): Stack elements, reduce font sizes
  - Tablet (640-1024px): Adjust spacing, scale images
  - Desktop (> 1024px): Full design as specified

---

## Testing Checklist

- [ ] Assets load correctly from public directory
- [ ] Fonts render properly (Saprona, Apple Garamond)
- [ ] Gradient text displays correctly
- [ ] Glass-morphism effects work across browsers
- [ ] Prompt input functionality preserved
- [ ] Header navigation works
- [ ] Responsive design works on mobile/tablet
- [ ] No layout shift on page load
- [ ] Images optimized and loading correctly
- [ ] Accessibility: keyboard navigation, screen readers
- [ ] Performance: Lighthouse score > 90
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

## Rollback Plan

If issues arise during implementation:

1. Restore backup: `mv "app/(public)/landing/page.tsx.backup" "app/(public)/landing/page.tsx"`
2. Remove new component files
3. Revert Tailwind config changes
4. Remove installed dependencies: `pnpm remove tailwindcss-textshadow`
5. Clear Next.js cache: `rm -rf .next`
6. Restart dev server

---

## Future Enhancements

After completing the core refactoring, consider:

1. **Animation & Motion**
   - Fade-in animations for hero text
   - Parallax scrolling for chain elements
   - Smooth scroll transitions

2. **Interactive Elements**
   - Agent selector dropdown functionality
   - Prompt input auto-suggestions
   - Animated typing effect in placeholder

3. **Content Sections**
   - Populate bottom section with agent marketplace
   - Add testimonials or social proof
   - Feature comparison table

4. **SEO & Meta**
   - Update OG images to match new design
   - Add structured data for search engines
   - Optimize meta descriptions

---

## Questions & Decisions Needed

1. **Font Licensing**: Do we have licenses for Saprona and Apple Garamond? Or use alternatives?
2. **Asset Optimization**: Should we use WebP/AVIF formats for better compression?
3. **Agent Selector**: What functionality should "Random Agent" pill provide?
4. **Bottom Section**: What content should populate the glass-morphism container?
5. **Branding Rollout**: Is "Merak" confirmed as new brand name across all touchpoints?

---

## Related Documentation

- `.agent/System/project_architecture.md` - Current system architecture
- `.agent/README.md` - Documentation index
- `components/PromptInput.tsx` - Current input component implementation
- `app/(public)/landing/page.tsx` - Current landing page

---

**Last Updated**: 2025-10-15
**Author**: Claude Code
**Status**: Ready for Implementation
**Estimated Time**: 6-8 hours
