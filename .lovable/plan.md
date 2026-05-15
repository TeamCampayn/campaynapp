# Campayn — Gen Z + AI-feel Overhaul

## Brand voice
- Tagline: **"Empowering brands, elevating creators."**
- Motto: **Collab · Create · Collect**
- Logo: use uploaded Campayn mark on splash, auth, onboarding, empty states.

## 1. Splash + Onboarding (Gen Z + AI feel)

**Splash (`src/routes/index.tsx`)**
- Animated Campayn logo (scale-in → soft pulse), gradient mesh background (indigo → violet → soft pink), grain overlay.
- Tagline fades in below. 1.4s then route to `/onboarding-tour` (new) or `/auth` if seen.

**Onboarding tour (new `src/routes/onboarding-tour.tsx`)**
- 3 horizontally scrollable screens (snap):
  1. **Collab** — "Brands find you" — animated brand-logo orbit
  2. **Create** — "AI helps you script & caption" — typing-animation chip cluster
  3. **Collect** — "Get paid per view" — animated indigo coin counter
- Pagination dots, "Skip" top-right, "Get started" CTA at bottom.
- Bottom: **Continue with Google** + **Sign up with email** + tiny "Sign in" link.

**Auth (`src/routes/auth.tsx`)**
- Add Google OAuth via Lovable managed (`lovable.auth.signInWithOAuth("google")`).
- Glass card, gradient background, larger Campayn wordmark.

## 2. Visual language — "AI feel" without AI imagery

Add to `src/styles.css`:
- `--gradient-mesh`: subtle indigo→violet→pink radial mesh for hero areas
- `.glass`: `backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(60,76,226,0.08)]`
- `.glass-dark` variant for dark hero zones
- `.chip-glass`: pill with backdrop blur, subtle gradient border, sparkle dot when active
- `.shimmer`: animated gradient sweep utility for AI-thinking states
- `.grain`: SVG noise overlay for hero cards
- New animation tokens: `float`, `aurora-shift`, `coin-pulse`

**Chips refresh** (Discover filter chips, tabs)
- Replace flat pills with glass chips: backdrop-blur, gradient ring on active, tiny ✦ sparkle icon, soft inner shadow.
- Active chip gets indigo→violet gradient + white text + glow.

## 3. Discover page

- Hero band at top: `Recommended for you · matched to your niche & ~{avgViews} views`
- "Recommended for You" rail = filtered by niche overlap + tier match (replaces generic "Top Picks").
- Greeting becomes glass chip with sparkle.
- Filter chips → glass style.
- Card UI unchanged (user likes it) — only swap chip styles inside CampaignCard.

## 4. 50+ Demo campaigns + 10-12 real logos

New seed migration inserts 50 campaigns spanning niches: tech, lifestyle, fashion, beauty, food, fitness, gaming, finance, travel, education, parenting, automotive.

**Real brand logos** (Wikimedia / Clearbit) for ~12 hero brands:
Myntra, Zomato, Swiggy, Cred, Mamaearth, boAt, Nykaa, Cult.fit, Groww, MakeMyTrip, Sleepy Owl, BlueStone.
Other campaigns use monogram fallback (already handled by `BrandLogo`).

Logos uploaded to `brand-assets` storage bucket; campaign rows reference public URLs.

## 5. My Campaigns — full flow per status

**`app.application.$id.tsx`** redesigned with stage-specific UI:

```text
applied        → "You're in the queue"  + brand expectations card
approved       → "Submit your script"   + script editor + AI generate
script_submit  → "Brand reviewing"      + countdown + tips
revision_req   → "Changes requested"    + brand feedback card + resubmit
script_approved→ "Post your video"      + posting checklist + deadline
video_submit   → "Verifying post"       + view-tracking placeholder
posted         → "Earnings live"        + live view counter + projected ₹
verified       → "Payout maturing"      + countdown to payout date
paid           → "Paid ✓"               + transaction link + share earnings
```

Vertical timeline with 8 stages, current one expanded with action card. Notifications hook into stage changes (already in DB).

## 6. Profile — Campayn Score detail

- Tap score → opens `/app/score` (new route) with breakdown:
  - Animated radial gauge (current value vs 1000)
  - Component bars: Campaigns done, Reliability, Engagement, Avg views tier, Content quality
  - Formula explained in plain English
  - "How to improve" tip cards
- Profile also shows: connected platforms with stats, niches as glass chips, recent campaigns rail.

## 7. Wallet — keep structure, add AI feel

- Hero card → glass + gradient mesh + grain, shimmer on balance number on first mount
- "Maturing payouts" gets thin progress ring per item
- Quick-actions row with glass chips
- No restructure.

## 8. Personalization (Utkarsh login)

On Discover load:
1. Fetch profile niches + max avg_views
2. Sort campaigns: niche-match first, then tier-match, then CPV
3. "Recommended for You" rail shows top 5 niche matches with `Match {n}%` badge

## Technical notes

- New files: `src/routes/onboarding-tour.tsx`, `src/routes/app.score.tsx`, `src/components/app/GlassChip.tsx`, `src/components/app/Sparkle.tsx`, `src/components/app/StageTimeline.tsx`
- Edited: `src/styles.css`, `src/routes/index.tsx`, `src/routes/auth.tsx`, `src/routes/onboarding.tsx`, `src/routes/app.discover.tsx`, `src/routes/app.application.$id.tsx`, `src/routes/app.profile.tsx`, `src/routes/app.wallet.tsx`, `src/components/app/CampaignCard.tsx`
- Migration: seed 50 campaigns with niche diversity + 12 real logos uploaded to `brand-assets`
- Auth: enable managed Google via `configure_social_auth(["google"])`
- Out of scope: real Instagram OAuth data sync, push notifications, real view-bot, payout cron

## Demo account
`utkarsh@campayn.in / #campayn` — already seeded; will be re-seeded with niche-aligned applications (tech, lifestyle) so the personalized rail shows real matches.
