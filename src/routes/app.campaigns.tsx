import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Clock } from "lucide-react";
import { RupeeCoin, compactInr } from "@/components/app/RupeeCoin";
import { BrandCover } from "@/components/app/BrandCover";
import { BrandLogo } from "@/components/app/BrandLogo";
import { NotificationsBell } from "@/components/app/NotificationsBell";

export const Route = createFileRoute("/app/campaigns")({
  head: () => ({ meta: [{ title: "My Campaigns - Campayn" }] }),
  component: MyCampaigns,
});

const STAGE_ORDER = ["applied","approved","script_submitted","script_approved","revision_requested","video_submitted","video_approved","posted","verified","paid","withdrawn"];
function stageIndex(s: string) { return Math.max(0, STAGE_ORDER.indexOf(s)); }

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  applied:             { label: "Applied",          color: "#3C4CE2", bg: "rgba(60,76,226,0.10)" },
  approved:            { label: "Submit script",    color: "#8B5CF6", bg: "rgba(139,92,246,0.10)" },
  script_submitted:    { label: "Script in review", color: "#F59F0A", bg: "rgba(245,159,10,0.12)" },
  script_approved:     { label: "Post your video",  color: "#21C45D", bg: "rgba(33,196,93,0.12)" },
  revision_requested:  { label: "Revision needed",  color: "#EF4343", bg: "rgba(239,67,67,0.10)" },
  video_submitted:     { label: "Video in review",  color: "#F59F0A", bg: "rgba(245,159,10,0.12)" },
  video_approved:      { label: "Approved · Post",  color: "#21C45D", bg: "rgba(33,196,93,0.12)" },
  posted:              { label: "Tracking views",   color: "#3C4CE2", bg: "rgba(60,76,226,0.10)" },
  verified:            { label: "Verified",         color: "#21C45D", bg: "rgba(33,196,93,0.12)" },
  paid:                { label: "Paid",             color: "#21C45D", bg: "rgba(33,196,93,0.12)" },
  withdrawn:           { label: "Withdrawn",        color: "#65758B", bg: "#EEF2F6" },
  rejected:            { label: "Not selected",     color: "#EF4343", bg: "rgba(239,67,67,0.10)" },
};

const FILTERS = [
  { v: "all",     l: "All" },
  { v: "action",  l: "Action needed", match: (s: string) => ["approved","script_approved","revision_requested","video_approved"].includes(s) },
  { v: "review",  l: "In review",     match: (s: string) => ["script_submitted","video_submitted","applied"].includes(s) },
  { v: "live",    l: "Live",          match: (s: string) => ["posted","verified"].includes(s) },
  { v: "paid",    l: "Paid",          match: (s: string) => ["paid","withdrawn"].includes(s) },
];

function MyCampaigns() {
  const [items, setItems] = useState<any[] | null>(null);
  const [tab, setTab] = useState<string>("all");

  useEffect(() => {
    supabase.from("applications")
      .select("*, campaigns(*)")
      .order("applied_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  const totals = useMemo(() => {
    if (!items) return { earned: 0, live: 0, action: 0 };
    return {
      earned: items.filter(a => a.status === "paid").reduce((s, a) => s + (a.final_earning_inr ?? 0), 0),
      live: items.filter(a => ["posted","verified"].includes(a.status)).length,
      action: items.filter(a => ["approved","script_approved","revision_requested","video_approved"].includes(a.status)).length,
    };
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return null;
    const f = FILTERS.find(x => x.v === tab);
    if (!f || !f.match) return items;
    return items.filter(a => f.match!(a.status));
  }, [items, tab]);

  return (
    <div className="px-5 pt-8 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black tracking-tight">My Campaigns</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Track every collab from apply to payout</p>
        </div>
        <NotificationsBell />
      </div>

      {/* Top stats */}
      {items && items.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <div className="cmp-card p-3.5">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Earned</div>
            <div className="mt-1 inline-flex items-baseline gap-1">
              <RupeeCoin size={16} />
              <span className="font-black text-[18px]">{compactInr(totals.earned)}</span>
            </div>
          </div>
          <div className="cmp-card p-3.5">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Live</div>
            <div className="mt-1 font-black text-[20px]">{totals.live}</div>
          </div>
          <div className="cmp-card p-3.5">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">To-do</div>
            <div className="mt-1 font-black text-[20px] text-primary">{totals.action}</div>
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {FILTERS.map(f => {
          const active = tab === f.v;
          return (
            <button key={f.v} onClick={() => setTab(f.v)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition border ${
                active
                  ? "bg-primary text-white border-transparent shadow-[0_8px_22px_-8px_rgba(60,76,226,0.5)]"
                  : "bg-white text-foreground border-border"
              }`}>
              {f.l}
            </button>
          );
        })}
      </div>

      {filtered === null && (
        <div className="mt-6 space-y-4">
          {[1,2].map(i => <div key={i} className="h-64 rounded-2xl bg-white border border-border animate-pulse" />)}
        </div>
      )}

      {filtered?.length === 0 && (
        <div className="mt-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-secondary grid place-items-center">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <p className="mt-4 font-semibold">Nothing here yet</p>
          <p className="text-sm text-muted-foreground mt-1">Find your next brief on Discover.</p>
          <Link to="/app/discover" className="mt-4 inline-flex btn-secondary">Browse campaigns</Link>
        </div>
      )}

      <ul className="mt-5 space-y-4">
        {filtered?.map(a => {
          const c = a.campaigns;
          const meta = STATUS_META[a.status] ?? STATUS_META.applied;
          const idx = stageIndex(a.status);
          const totalSteps = 6;
          const progress = Math.min(totalSteps, Math.round((idx / 9) * totalSteps));
          const earn = a.final_earning_inr ?? a.estimated_earning_inr ?? 0;
          const hours = c?.deadline ? Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 3600000)) : null;
          const timeLabel = hours === null ? null : hours <= 24 ? `${hours}h left` : `${Math.ceil(hours / 24)}d left`;
          return (
            <li key={a.id}>
              <Link to="/app/application/$id" params={{ id: a.id }}
                className="cmp-card block active:scale-[0.99] transition">
                <div className="relative">
                  <BrandCover brandName={c?.brand_name ?? "?"} brandLogoUrl={c?.brand_logo_url}
                    coverUrl={c?.cover_image_url} height={170} />
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-white rounded-full pl-1 pr-3 py-1 text-[12px] shadow-sm">
                    <BrandLogo name={c?.brand_name ?? "?"} url={c?.brand_logo_url} size={22} rounded="full" />
                    <span className="font-semibold text-foreground">{c?.brand_name}</span>
                  </div>
                  <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm"
                    style={{ background: meta.bg, color: meta.color }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                    {meta.label}
                  </span>
                </div>
                <div className="px-4 pt-3.5 pb-4">
                  <h3 className="text-[15.5px] font-bold leading-snug text-foreground line-clamp-2 min-h-[40px]">{c?.title}</h3>
                  <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5">
                      <RupeeCoin size={18} />
                      <span className="text-[17px] font-black text-foreground tracking-tight">{compactInr(earn)}</span>
                    </span>
                    <span className="text-[12px] text-muted-foreground font-medium">
                      {a.status === "paid" ? "received" : a.status === "verified" ? "final" : "estimated"}
                    </span>
                    {timeLabel && a.status === "applied" && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {timeLabel}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-6 gap-1.5">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                      <span key={i} className="h-1.5 rounded-full transition-colors"
                        style={{ background: i < progress ? "var(--primary)" : "#E1E7EF" }} />
                    ))}
                  </div>
                  <div className="mt-2 text-[11.5px] text-muted-foreground">
                    Tap to open the timeline, scripts and brand feedback
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
