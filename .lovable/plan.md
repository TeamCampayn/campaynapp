## Scope

End state: a polished demo you can log into as **utkarsh@campayn.in / #campayn** with Instagram + YouTube pre-connected, an application mid-flow on the Script step, a wallet with real transactions, and the new design language applied across the app. No more yellow dot — every ₹ uses an **indigo ₹ token**. Brand logos render reliably.

## 1. Design tokens (one-shot reskin)

- New `<RupeeCoin>` component (SVG, indigo gradient `#3C4CE2 → #7586F5`, white **₹** glyph, soft shadow). Used everywhere a ₹ amount appears. Removes every inline yellow dot in `app.campaigns`, `app.profile`, `app.wallet`, `CampaignCard`, etc.
- Drop the literal `₹` prefix on amounts that sit next to the coin (the coin IS the rupee mark).
- `coin-pill` in `styles.css` repainted to indigo gradient, white text — kept dark navy variant only for the campaign-detail earnings hero.

## 2. Brand logo rendering

Root cause: `<img src=brand_logo_url>` fails when the upstream host blocks hotlinking even with `referrerPolicy="no-referrer"`.

Fix:
- New `<BrandLogo name url size>` component: `<img>` with `onError → fallback to monogram tile` (first letter on `grad-primary`).
- Use it everywhere brand logos appear (cards, detail hero, my-campaigns row, application page).
- Seed campaigns store logos in **Supabase Storage** (new public bucket `brand-assets`) so they always load. Admin-uploaded logos go there too.

## 3. Bottom nav → 4 tabs

`Discover · Campaigns · Wallet · Profile`. Inbox tab removed. A bell icon in each page header opens a notifications sheet (re-uses existing `notifications` table). Inbox-style "you have an action" cards merge into Campaigns under a new **Action Needed** tab (already exists — we wire it to live data).

## 4. Campaigns tab = full creator workflow

Per-application detail (`/app/application/$id`) becomes the workspace, with a vertical timeline:
1. Applied → 2. Approved (brief unlocked) → 3. Generate Content Ideas (AI) → 4. Submit Script → 5. Script approved / revision → 6. Shoot & Post → 7. Verify post URL → 8. Views accruing (7-day window, configurable per campaign) → 9. Paid.

Each step is a card the creator interacts with. The **AI block** has 3 buttons:
- **Generate Content Ideas** — calls `ai-helper` with `kind: "ideas"`, returns 3 hook/angle ideas tailored to the creator's niche + brand brief.
- **Generate Script Ideas** — `kind: "script"`, returns 30/60s script.
- **Generate Caption Ideas** — `kind: "caption"`, returns 3 captions + hashtags.

Backend: `ai-helper` edge function exists; we extend it with these `kind`s. Inputs include the campaign brief, do/dont, the creator's niches + handle bio (from `social_connections`).

Closing-soon timer fix: replace the broken `closes_at`-style logic with `campaigns.deadline` (which exists). Pill shows when `deadline - now < 24h`.

## 5. Wallet redesign

New layout:
- **Hero**: indigo coin balance + "≈ ₹X cash withdrawable" + Withdraw CTA.
- **Stat row**: Lifetime earned · This month · Pending (in 7-day window).
- **Pending payouts list**: per-application card showing post URL, current verified views, projected payout, "matures in Xd Yh".
- **Transactions**: grouped by month, icons per kind (`bonus`, `earning`, `withdrawal`, `referral`, `penalty`).
- **Anti-fraud notice card**: "Fake views are auto-flagged. Flagged content forfeits payout and may permanently ban your account." Linked to Help.
- **Withdraw sheet**: UPI / Bank, min ₹100, KYC-gated.

## 6. Profile redesign

- Header: avatar, name, city, **Campayn Score (0–1000)** with tier label (Rookie/Rising/Pro/Elite/Legend) and a thin radial gauge.
- Stat grid: Followers · Avg views · Engagement % · Campaigns done.
- **Growth graph card**: 8-week sparkline of views and earnings (sampled from `applications` + seeded data). Built with inline SVG — no extra deps.
- Profile completion card (kept) with reward CTA.
- Lifetime earned banner (repainted indigo, no yellow).
- Platform connections (IG handle, followers, ER, avg views, bio fetched at OAuth — for demo we seed them).
- Cards: KYC · Refer & earn · Campayn Score breakdown · Payout settings · Help · Sign out.

**Campayn Score formula** (your option 1, normalized to 0–1000):
```
score =
   campaigns_done * 8                 (cap 200)
 + reliability_pct * 2                (cap 200, reliability = on-time/total)
 + engagement_rate_pct * 10           (cap 200)
 + avg_views_tier                     (0/50/120/200 for <5k/<50k/<250k/250k+)
 + content_quality * 200              (approved / (approved+revisions+rejected))
 - 5% per quarter of inactivity
```
Stored on `profiles.campayn_score` (new int column) + breakdown JSON in `profiles.score_breakdown`. Recomputed via SQL function `recompute_campayn_score(uuid)` triggered after application status changes.

## 7. Discover polish

- Clean up card grid spacing, fix the "Closing soon" logic.
- Top-Picks rail uses `social_connections.niches` ↔ `campaigns.target_niches` overlap.
- Filter chips align to one row, scroll horizontally only when overflow.

## 8. Backend changes (one migration)

- `profiles`: add `campayn_score int default 0`, `score_breakdown jsonb default '{}'`, `instagram_bio text`, `youtube_about text`.
- `campaigns`: add `payout_window_days int default 7`.
- `applications`: add `posted_at timestamptz`, `payout_due_at timestamptz` (computed = `posted_at + payout_window_days`), `is_flagged boolean default false`, `flag_reason text`.
- New table `view_snapshots(application_id, captured_at, views)` for the growth graph + payout calc.
- Storage bucket `brand-assets` (public read).
- SQL function `recompute_campayn_score(uuid)`.
- RLS on all new columns/tables follows existing self/admin pattern.

## 9. Demo data (seed)

After migration, insert via the data tool:
- Auth user `utkarsh@campayn.in` (password `#campayn`, email pre-confirmed).
- Profile: name "Utkarsh Sharma", Mumbai, niches `["tech","lifestyle"]`, completion 85, score ~742.
- `social_connections`: Instagram `@utkarsh.creates` (62k followers, 4.8% ER, 38k avg views, bio seeded), YouTube `@utkarshcreates` (18k subs).
- KYC: `verified`.
- 6 campaigns with real brand logos in storage (Boat, Mamaearth, CRED, Zomato, Myntra, Cult.fit).
- Applications: 1 on **Submit Script** step, 1 **Script in review**, 1 **Live & accruing views** (with 7 days of `view_snapshots`), 1 **Paid**, 1 just **Applied**.
- Transactions: welcome bonus, 2 earnings, 1 withdrawal, 1 referral.
- Notifications matching each step.

## Technical notes

- All AI calls use the existing `ai-helper` edge function (Lovable AI Gateway, `google/gemini-2.5-flash`). New `kind` switch added there.
- Realtime not added (out of scope).
- No new npm packages.
- Files touched: `src/styles.css`, `src/components/app/{RupeeCoin,BrandLogo,CampaignCard,BottomNav}.tsx`, `src/routes/app.{discover,campaigns,campaign.$id,application.$id,wallet,profile,inbox}.tsx`, `src/router.tsx` (nav config), `supabase/functions/ai-helper/index.ts`, one new migration, one data seed via insert tool.

## Out of scope (call out now)

- Real Instagram/YouTube OAuth (we stub the data — UI shows "Connected" badges).
- Real fake-view bot (we expose the `is_flagged` flag + UI copy; no model).
- Push notifications.

If this looks right, I'll execute it end-to-end. Reply **approve** (or tell me what to change).