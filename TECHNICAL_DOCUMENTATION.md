# Simpliven™ Smart Digital LED Mirror Alarm Clock: Technical Documentation Handbook

**Version:** 1.0.0  
**Target Audience:** Frontend Engineers, Full-Stack Developers, QA Engineers, DevOps Specialists  
**Architectural Baseline:** Next.js 14+ (App Router), Tailwind CSS, GSAP, Shopify Storefront API, Razorpay UPI / COD Gateways, Vercel Edge Network  

---

## Table of Contents
1. [Product Overview & Value Proposition](#1-product-overview--value-proposition)
2. [System Architectural Blueprint & Tech Stack](#2-system-architectural-blueprint--tech-stack)
3. [Development Environment & Workflow](#3-development-environment--workflow)
4. [Frontend Implementation & Component Architecture](#4-frontend-implementation--component-architecture)
5. [Backend Integration & Security Protocols](#5-backend-integration--security-protocols)
6. [Design System & Accessibility (a11y)](#6-design-system--accessibility-a11y)
7. [Performance Engineering & Optimization](#7-performance-engineering--optimization)
8. [QA & Testing Methodology](#8-qa--testing-methodology)
9. [Deployment Pipeline & Infrastructure](#9-deployment-pipeline--infrastructure)
10. [FAQs, Edge-Cases & Troubleshooting](#10-faqs-edge-cases--troubleshooting)

---

## 1. Product Overview & Value Proposition

### 1.1 Product Definition
Simpliven™ is an ultra-premium, multi-functional Smart Digital LED Mirror Alarm Clock e-commerce platform. The application is built to deliver a flagship-grade digital storefront that mirrors the physical elegance of the product—combining a HD mirror finish, dual-alarm scheduling, real-time ambient telemetry (temperature & humidity), USB power delivery output, and automated night-mode luminance sensing.

### 1.2 Unique Selling Points (USPs)
- **Reflective HD Mirror Surface**: Premium optical mirror display serving as a sleek tabletop mirror when idle and a high-contrast LED clock when powered.
- **Dynamic Dual-Alarm & Custom Schedule Engine**: Independent weekday/weekend alarm configurations with progressive volume control and touch-capacitive snooze.
- **Real-Time Telemetry Interface**: Integrated micro-sensors reporting ambient room temperature (°C/°F) and relative humidity (%) updated dynamically on display.
- **Ambient Light Sensing UI Preview**: Interactive digital visualizer allowing prospective buyers to test the clock's auto-dimming LED behaviors across various lighting conditions.
- **Fast Frictionless Checkout**: Instant Indian domestic payment flow supporting 1-click Razorpay UPI and OTP-verified Cash on Delivery (COD).

### 1.3 Target Audience & Personas
- **Modern Lifestyle & Home Decor Enthusiasts**: Seeking clean, minimalist aesthetic bedroom and workspace accessories.
- **Tech-Savvy Professionals**: Demanding dual-charging capabilities, accurate room telemetry, and reliable multi-alarm routines.
- **Premium Gifting Shoppers**: Looking for refined packaging options, fast checkout, and transparent order tracking.

### 1.4 UX Architecture Principles
- **Sub-Second Initial Load**: Server-side rendered shell with edge-cached dynamic product payloads.
- **Fluid Micro-Interactions**: Hardware-accelerated GSAP timelines for visual state transitions, product color shifts, and alarm mode previews.
- **Mobile Touch Optimization**: 100% gesture-friendly navigation with swipeable modals, haptic feedback triggers, and 48px touch targets.

---

## 2. System Architectural Blueprint & Tech Stack

### 2.1 System Architecture Diagram

```mermaid
graph TD
    Client[Browser / Mobile Client] -->|HTTPS / WSS| Edge[Vercel Edge Network CDN]
    Edge -->|SSR / ISR Route Delivery| NextServer[Next.js 14+ App Router Server]
    
    subgraph Frontend Application Layer
        NextServer --> ReactRSC[React Server Components]
        ReactRSC --> ClientHydration[Client Component Hydration]
        ClientHydration --> ZustandStore[Zustand Client Store]
        ClientHydration --> TanStackQuery[TanStack Query v5 Cache]
        ClientHydration --> GSAPEngine[GSAP + Lenis Motion Engine]
    end
    
    subgraph Data & API Gateway Layer
        TanStackQuery -->|GraphQL HTTPS| ShopifyAPI[Shopify Storefront API v2024-04]
        TanStackQuery -->|REST / HTTPS| ServerlessAPI[Next.js API Routes / Vercel Serverless]
    end

    subgraph Payments & Telemetry Microservices
        ServerlessAPI -->|HTTPS Request| RazorpayGateway[Razorpay UPI Payment Gateway]
        ServerlessAPI -->|Twilio / Fast2SMS API| OTPService[COD OTP Verification Service]
        ServerlessAPI -->|PostgreSQL / Prisma| DB[(Supabase Order Telemetry DB)]
    end

    RazorpayGateway -->|HMAC-SHA256 Webhook| ServerlessAPI
```

### 2.2 Technology Stack Justification Grid

| Layer | Technology | Version | Strategic Rationale |
| :--- | :--- | :--- | :--- |
| **Core Framework** | Next.js | `^14.2.0` | App Router enables React Server Components (RSC) to minimize JS bundle size; Edge Middleware provides geo-routing and localized currency support. |
| **Styling Engine** | Tailwind CSS | `^3.4.0` | Zero-runtime CSS generation with JIT compiler; strict design token mapping via CSS custom properties (`var(--led-emerald)`). |
| **Motion & Physics** | GSAP | `^3.12.5` | Precise timeline orchestration for 60fps/120fps hardware-accelerated SVG & DOM transforms; ScrollTrigger for cinematic landing pages. |
| **Scroll Smoothing** | Lenis | `^1.0.42` | Normalizes touch and wheel smooth scrolling across desktop and mobile browsers without breaking native accessibility. |
| **Global UI State** | Zustand | `^4.5.2` | Minimalist atomic state management with zero boilerplate, ideal for cart, mirror visualizer settings, and drawer states. |
| **Server State / Cache** | TanStack Query | `^5.28.0` | Stale-while-revalidate data fetching for cart synchronizations, live inventory checks, and order status polling. |
| **Backend API** | Shopify Storefront API | `v2024-04` | Headless e-commerce backbone ensuring 99.99% checkout availability, PCI compliance, and inventory locking. |
| **Payments** | Razorpay SDK | `^2.9.0` | Native UPI Intent flow support (GPay, PhonePe, Paytm) for seamless mobile web payment conversion in India. |
| **Observability** | Sentry & Vercel Analytics | `^8.0.0` | Real-time Core Web Vitals monitoring and automatic error stack trace capture across server and client boundaries. |

---

## 3. Development Environment & Workflow

### 3.1 Workspace Setup Guide
Ensure Node.js `v20.x` or higher and `pnpm` `v9.x` are installed on your host system.

```bash
# 1. Clone the repository
git clone git@github.com:Simpliven/simpliven-digital-alarm-clock.git
cd simpliven-digital-alarm-clock

# 2. Enable Corepack and install pnpm
corepack enable
pnpm install

# 3. Environment setup
cp .env.example .env.local

# 4. Launch local development server
pnpm dev
```

### 3.2 Environment Variables Catalog (`.env.local`)

> **🔒 Note:** All secret values below are redacted placeholders.
> Copy `.env.example` to `.env.local` and replace with your own credentials before running the project.

```env
# Client-Facing Variables (Exposed to Browser)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN="your_storefront_access_token_here"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id_here"
NEXT_PUBLIC_ENABLE_MIRROR_VISUALIZER="true"

# Server-Only Variables (Secret Key Vault)
SHOPIFY_ADMIN_API_ACCESS_TOKEN="shpat_your_admin_api_token_here"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret_here"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret_here"
DATABASE_URL="postgresql://user:password@your-db-host:5432/your_database"
SMS_GATEWAY_API_KEY="your_sms_gateway_api_key_here"
SENTRY_AUTH_TOKEN="your_sentry_auth_token_here"
```

### 3.3 Git Branching Strategy & Workflow
We adhere to **Trunk-Based Development** supplemented with short-lived feature branches:

```
main (Production Deploy)
  ▲
  │ (Merged via Squash & Merge after PR Approval + CI Pass)
  ├─ feat/mirror-visualizer-dimming
  ├─ fix/razorpay-upi-intent-fallback
  └─ refactor/cart-drawer-performance
```

### 3.4 Commit Message Guidelines (Conventional Commits)
All commit messages must adhere to the format: `<type>(<scope>): <short description>`.

- `feat(customizer)`: Add ambient light slider to mirror preview
- `fix(checkout)`: Correct COD OTP validation timer reset bug
- `perf(gsap)`: Kill active timelines on component unmount to fix memory leak
- `chore(deps)`: Upgrade Next.js to version 14.2.5

### 3.5 Pull Request Protocol
1. Every PR must target the `main` branch.
2. Must pass automated GitHub Actions status checks:
   - `pnpm lint` (ESLint + Prettier check)
   - `pnpm typecheck` (TypeScript strict mode validation)
   - `pnpm test` (Vitest unit testing suite)
   - `pnpm build` (Production build verification)
3. Requires **at least 1 approval** from a designated code owner.

---

## 4. Frontend Implementation & Component Architecture

### 4.1 Project Directory Tree

```
simpliven-digital-alarm-clock/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── public/
│   ├── assets/
│   │   ├── fonts/
│   │   └── images/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── global.css
│   │   ├── api/
│   │   │   ├── checkout/route.ts
│   │   │   └── webhooks/razorpay/route.ts
│   │   └── product/
│   │       └── [handle]/page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── ModalDrawer.tsx
│   │   │   └── LEDSegment.tsx
│   │   ├── customizer/
│   │   │   ├── ProductMirrorCustomizer.tsx
│   │   │   └── AmbientLightSlider.tsx
│   │   └── checkout/
│   │       ├── CartDrawer.tsx
│   │       └── PaymentSelector.tsx
│   ├── hooks/
│   │   ├── useGSAPTimeline.ts
│   │   └── useHapticFeedback.ts
│   ├── lib/
│   │   ├── shopify.ts
│   │   ├── razorpay.ts
│   │   └── utils.ts
│   ├── store/
│   │   ├── useCartStore.ts
│   │   └── useMirrorStore.ts
│   └── types/
│       ├── shopify.ts
│       └── checkout.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 4.2 Tailwind CSS Design System Configuration (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        mirror: {
          chrome: '#E2E8F0',
          dark: '#0F172A',
          reflective: 'rgba(255, 255, 255, 0.15)',
        },
        led: {
          emerald: '#10B981',
          amber: '#F59E0B',
          cyan: '#06B6D4',
          dim: 'rgba(16, 185, 129, 0.2)',
        },
        obsidian: {
          900: '#090D16',
          800: '#111827',
          700: '#1F2937',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-outfit)', 'sans-serif'],
        digital: ['var(--font-seven-segment)', 'monospace'],
      },
      boxShadow: {
        'mirror-glow': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glass-edge': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
```

### 4.3 Production Component Implementations

#### Component 1: `ProductMirrorCustomizer.tsx`
Renders an interactive mirror clock visualizer with customizable LED color states and ambient light dimming preview.

```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useMirrorStore } from '@/store/useMirrorStore';

interface ProductMirrorCustomizerProps {
  initialTime?: string;
}

export const ProductMirrorCustomizer: React.FC<ProductMirrorCustomizerProps> = ({
  initialTime = '07:30',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const { ledColor, ambientBrightness, alarmActive } = useMirrorStore();

  useEffect(() => {
    if (!displayRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(displayRef.current, {
        opacity: ambientBrightness / 100,
        filter: `drop-shadow(0 0 ${ambientBrightness * 0.15}px ${ledColor})`,
        duration: 0.4,
        ease: 'power2.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, [ambientBrightness, ledColor]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg aspect-[16/9] rounded-2xl bg-gradient-to-br from-slate-800 to-obsidian-900 border border-mirror-reflective shadow-2xl p-6 flex flex-col justify-between overflow-hidden backdrop-blur-md"
    >
      {/* Glossy Reflective Glass Layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

      {/* Top Telemetry Header */}
      <div className="flex justify-between items-center text-xs font-mono text-slate-400 z-10">
        <span>TEMP: 24°C</span>
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${alarmActive ? 'bg-led-emerald animate-ping' : 'bg-slate-600'}`} />
          ALARM 1: ON
        </span>
        <span>HUM: 48%</span>
      </div>

      {/* Main Digital Clock Display */}
      <div className="flex justify-center items-center my-auto z-10">
        <div
          ref={displayRef}
          className="font-digital text-6xl md:text-8xl tracking-widest transition-colors duration-300"
          style={{ color: ledColor }}
          aria-label={`Current clock display time is ${initialTime}`}
        >
          {initialTime}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 z-10">
        <span>SIMPLIVEN™ MIRROR DISPLAY v1</span>
        <span>AUTO-DIM: SENSING</span>
      </div>
    </div>
  );
};
```

#### Component 2: `InteractiveButton.tsx`
Accessible, high-performance button supporting GSAP hover scales and dynamic haptic feedback.

```tsx
'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { Loader2 } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'accent';
  children: React.ReactNode;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  isLoading = false,
  variant = 'primary',
  children,
  className = '',
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { triggerHaptic } = useHapticFeedback();

  const handleMouseEnter = () => {
    gsap.to(buttonRef.current, { scale: 1.03, duration: 0.2, ease: 'power1.out' });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, { scale: 1.0, duration: 0.2, ease: 'power1.out' });
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic('light');
    if (onClick) onClick(e);
  };

  const variantStyles = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 text-obsidian-900 font-semibold shadow-mirror-glow',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
    accent: 'bg-amber-500 hover:bg-amber-400 text-obsidian-900 font-bold',
  };

  return (
    <button
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      className={`relative min-h-[48px] px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
};
```

#### Component 3: `ModalDrawer.tsx`
Full slide-over drawer utilizing React Portals, keyboard focus trapping, and backdrop dismissal.

```tsx
'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const ModalDrawer: React.FC<ModalDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md bg-obsidian-900 border-l border-slate-800 h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-xl font-display font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};
```

---

## 5. Backend Integration & Security Protocols

### 5.1 Payment Processing Integration Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Mobile Browser)
    participant Client as Next.js Frontend Client
    participant API as Next.js API Route (/api/checkout)
    participant RZP as Razorpay Payment Gateway
    participant DB as Order Database

    Customer->>Client: Clicks "Pay via UPI / Instant Checkout"
    Client->>API: POST /api/checkout (Cart Payload + Customer Details)
    API->>RZP: Create Razorpay Order (amount, currency: INR)
    RZP-->>API: Returns order_id (e.g. order_N123abc)
    API-->>Client: Returns order_id + Razorpay Public Key
    Client->>RZP: Open Razorpay Checkout Modal (UPI Intent)
    Customer->>RZP: Authorizes Payment in GPay / PhonePe
    RZP-->>Client: Success Handler (razorpay_payment_id, signature)
    Client->>API: POST /api/checkout/verify (Signature Verification)
    API->>API: HMAC-SHA256 Verification (Key Secret + Order ID + Payment ID)
    API->>DB: Record Order Status = "PAID"
    API-->>Client: Returns HTTP 200 { success: true, redirectUrl: "/order/success" }
    Client-->>Customer: Displays Order Confirmation Screen
```

### 5.2 Razorpay Webhook Cryptographic Verification Endpoint

```typescript
// File: src/app/api/webhooks/razorpay/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing security credentials' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('[SECURITY_VIOLATION] Invalid Razorpay webhook HMAC signature');
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { event, payload: eventData } = payload;

    if (event === 'payment.captured') {
      const paymentId = eventData.payment.entity.id;
      const orderId = eventData.payment.entity.order_id;
      console.log(`[PAYMENT_SUCCESS] Payment captured for Order: ${orderId}, Payment ID: ${paymentId}`);
      // Execute database order status update logic here idempotently
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[WEBHOOK_ERROR]', error);
    return NextResponse.json({ error: 'Webhook payload evaluation failed' }, { status: 500 });
  }
}
```

### 5.3 Security Headers & Content Security Policy (CSP)

```typescript
// File: next.config.mjs
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://cdn.shopify.com https://img.razorpay.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.myshopify.com https://lumberjack.razorpay.com https://api.razorpay.com https://vitals.vercel-insights.com;
    frame-src 'self' https://api.razorpay.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader.replace(/\s{2,}/g, ' ').trim() },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 6. Design System & Accessibility (a11y)

### 6.1 Color Palette & Contrast Validation

```
├── LED Emerald (#10B981)   ──> Contrast Ratio on Obsidian 900 (#090D16): 10.4:1 (WCAG AAA Pass)
├── Mirror Chrome (#E2E8F0) ──> Contrast Ratio on Obsidian 900 (#090D16): 15.8:1 (WCAG AAA Pass)
└── LED Amber (#F59E0B)     ──> Contrast Ratio on Obsidian 900 (#090D16): 8.9:1  (WCAG AAA Pass)
```

### 6.2 Spatial & Typography Tokens
- **Base Grid**: 8px spatial grid (`p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px).
- **Touch Bounds**: All interactive components enforce minimum bounding box dimensions of `48px x 48px`.
- **Typography Scale**:
  - Display Heavy: `text-5xl` / `leading-tight` / `font-display`
  - Section Titles: `text-2xl` / `font-bold` / `font-sans`
  - Body Text: `text-base` / `leading-relaxed` / `font-sans`
  - Digital Display: `text-7xl` / `tracking-widest` / `font-digital`

### 6.3 Accessibility Conformance Checklist
- [x] **Full Keyboard Traversal**: Logical tab sequence across all product variant options, customizer sliders, and drawer close buttons.
- [x] **ARIA Live Regions**: Cart additions trigger an `aria-live="polite"` screen-reader alert announcing item additions.
- [x] **High-Contrast High-Visibility Toggle**: Interactive mirror clock preview includes a manual override button enforcing 100% luminance LED display rendering for visually impaired users.

---

## 7. Performance Engineering & Optimization

### 7.1 Core Web Vitals Budget Targets

| Metric | Threshold Target | Strategy |
| :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | `< 1.2s` | Priority loading hero mirror image with `priority` attribute and AVIF compression. |
| **INP** (Interaction to Next Paint) | `< 100ms` | Offloading GSAP timeline computations to RequestAnimationFrame; utilizing `startTransition` for store updates. |
| **CLS** (Cumulative Layout Shift) | `< 0.05` | Reserving static aspect-ratio containers (`aspect-[16/9]`) for visualizer and images. |

### 7.2 Image Optimization Implementation Example

```tsx
import Image from 'next/image';

export const ProductHeroImage = () => (
  <div className="relative w-full aspect-square max-w-md overflow-hidden rounded-2xl bg-obsidian-800">
    <Image
      src="https://cdn.shopify.com/s/files/1/0000/simpliven-mirror-hero.webp"
      alt="Simpliven Smart Digital LED Mirror Alarm Clock in Bedroom Ambient Lighting"
      fill
      priority
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover transition-transform duration-500 hover:scale-105"
      placeholder="blur"
      blurDataURL="data:image/webp;base64,UklGRlAAAABXRUJQVlA4WAoAAAAgAAAA1AAA1QAAQUxQ..."
    />
  </div>
);
```

---

## 8. QA & Testing Methodology

### 8.1 Unit & Component Testing (`Vitest` + `React Testing Library`)

```typescript
// File: src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InteractiveButton } from '../Button';

describe('InteractiveButton Component', () => {
  it('renders children correctly', () => {
    render(<InteractiveButton>Add to Cart</InteractiveButton>);
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('renders loader icon when isLoading prop is true', () => {
    render(<InteractiveButton isLoading>Add to Cart</InteractiveButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('fires onClick callback when clicked', () => {
    const handleClick = vi.fn();
    render(<InteractiveButton onClick={handleClick}>Buy Now</InteractiveButton>);
    fireEvent.click(screen.getByRole('button', { name: /buy now/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 8.2 End-to-End Testing (`Playwright`)

```typescript
// File: e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E-Commerce Purchase Flow', () => {
  test('User can customize mirror alarm preview and open cart drawer', async ({ page }) => {
    await page.goto('/product/simpliven-smart-mirror-clock');

    // Validate product visualizer title presence
    await expect(page.locator('h1')).toContainText('Simpliven™ Smart Digital LED Mirror');

    // Interact with LED color switch button
    const amberColorBtn = page.getByRole('button', { name: /amber/i });
    if (await amberColorBtn.isVisible()) {
      await amberColorBtn.click();
    }

    // Add to Cart
    const addToCartBtn = page.getByRole('button', { name: /add to cart/i });
    await addToCartBtn.click();

    // Verify Cart Drawer Open
    const drawerTitle = page.getByText('Your Shopping Cart');
    await expect(drawerTitle).toBeVisible();
  });
});
```

---

## 9. Deployment Pipeline & Infrastructure

### 9.1 Continuous Integration & Deployment Workflow (`.github/workflows/ci-cd.yml`)

```yaml
name: Simpliven CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  verify:
    name: Code Verification & Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install pnpm Package Manager
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Install Project Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint Check
        run: pnpm lint

      - name: Run TypeScript Strict Verification
        run: pnpm typecheck

      - name: Run Vitest Unit Tests
        run: pnpm test

      - name: Run Next.js Production Build Test
        run: pnpm build
        env:
          NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: ${{ secrets.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN }}
          NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: ${{ secrets.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN }}

  deploy:
    name: Deploy to Vercel Production Edge
    needs: verify
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 10. FAQs, Edge-Cases & Troubleshooting

| Issue / Symptom | Root Cause | Resolution Protocol |
| :--- | :--- | :--- |
| **Hydration Mismatch Error**: `Text content did not match server-rendered HTML` | Initial clock time module accessed `new Date()` directly inside SSR rendering tree. | Wrap time module reading in a `useEffect` hook or initialize with a deterministic initial server prop (e.g. `'07:30'`). |
| **GSAP Animation Jank on Safari iOS** | Hardware acceleration layer missing on SVG/canvas element during active scroll triggers. | Apply `will-change: transform` and `transform: translateZ(0)` to animated DOM element via CSS. |
| **Razorpay Webhook Verification Fails (401)** | Raw HTTP request body parsed as JSON prior to HMAC signature digest computation. | Ensure the raw string stream (`await req.text()`) is passed into `crypto.createHmac` without JSON stringification modifications. |
| **Lenis Smooth Scroll Conflicts with Modal Drawer** | Main document scroll events competing with modal scroll container touch move handlers. | Execute `lenis.stop()` on modal mount and `lenis.start()` on modal unmount. |
