import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase } from "lucide-react";
import { RupeeCoin, compactInr } from "@/components/app/RupeeCoin";
import { BrandLogo } from "@/components/app/BrandLogo";
import { NotificationsBell } from "@/components/app/NotificationsBell";

export const Route = createFileRoute("/app/campaigns")({
  head: () => ({ meta: [{ title: "My Campaigns - Campayn" }] }),
  component: MyCampaigns,
});

const STAGES = ["applied","approved","script_submitted","script_approved","revision_requested","video_submitted","video_approved","posted","verified","paid","withdrawn"];
function stageIndex(s: string) { return STAGES.indexOf(s); }

const TABS: { v: string; l: string; match: (s: string) => boolean }[] = [
  { v: "action", l: "Action Needed", match: s => ["approved","script_approved","revision_requested","video_approved"].includes(s) },
  { v: "applied", l: "Applied", match: s => s === "applied" },
  { v: "review",  l: "In Review", match: s => ["script_submitted","video_submitted"].includes(s) },
  { v: "live",    l: "Live", match: s => ["posted","verified"].includes(s) },
  { v: "paid",    l: "Paid", match: s => ["paid","withdrawn"].includes(s) },
];

const STATUS_LABEL: Record<string,string> = {
  applied:"Applied", approved:"Submit script", script_submitted:"Script in review",
  script_approved:"Post your video", revision_requested:"Revision requested",
  video_submitted:"Video in review", video_approved:"Approved - go post",
  posted:"Posted - verifying", verified:"Verified", paid:"Paid", withdrawn:"Withdrawn",
  rejected:"Rejected",
};

function MyCampaigns() {
  const [tab, setTab] = useState("applied");
  const [items, setItems] = useState<any[] | null>(null);

  useEffect(() => {
    supabase.from("applications")
      .select("*, campaigns(*)")
      .order("applied_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  const cur = TABS.find(t => t.v === tab)!;
  const filtered = items?.filter(a => cur.match(a.status));
  const counts = Object.fromEntries(TABS.map(t => [t.v, items?.filter(a => t.match(a.status)).length ?? 0]));

  return (
    <div className="px-5 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-black tracking-tight">My Campaigns</h1>
        <NotificationsBell />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {TABS.map(t => {
          const active = tab === t.v;
          const c = counts[t.v];
          return (
            <button key={t.v} onClick={() => setTab(t.v)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition inline-flex items-center gap-2 ${
                active ? "bg-primary text-white shadow-[0_8px_24px_rgba(60,76,226,0.25)]" : "bg-white border border-border text-foreground"
              }`}>
              {t.l}
              {c > 0 && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-secondary text-primary"}`}>{c}</span>
              )}
            </button>
          );
        })}
      </div>

      {filtered === undefined && (
        <div className="mt-6 space-y-3">
          {[1,2].map(i => <div key={i} className="h-28 rounded-2xl bg-white border border-border animate-pulse" />)}
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

      <ul className="mt-5 space-y-3">
        {filtered?.map(a => {
          const c = a.campaigns;
          const idx = Math.max(0, stageIndex(a.status));
          const totalSteps = 6; // applied -> approved -> script -> video -> posted -> paid
          const progress = Math.min(totalSteps, Math.round((idx / 9) * totalSteps));
          const earn = a.final_earning_inr ?? a.estimated_earning_inr ?? 0;
          return (
            <li key={a.id}>
              <Link to="/app/application/$id" params={{ id: a.id }}
                className="cmp-card block p-4 active:scale-[0.99] transition">
                <div className="flex items-center gap-3">
                  <BrandLogo name={c?.brand_name ?? "?"} url={c?.brand_logo_url} size={48} rounded="xl" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14.5px] truncate">{c?.title}</div>
                    <div className="text-[12px] text-muted-foreground">{c?.brand_name}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-secondary text-primary inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {STATUS_LABEL[a.status] ?? a.status}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 grid grid-cols-6 gap-1.5">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <span key={i} className="h-1.5 rounded-full"
                      style={{ background: i < progress ? "var(--primary)" : "#E1E7EF" }} />
                  ))}
                </div>
                <div className="mt-2.5 inline-flex items-center gap-1.5">
                  <RupeeCoin size={16} />
                  <span className="font-black text-[15px]">{compactInr(earn)}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
