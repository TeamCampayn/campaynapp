import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { inrFmt } from "@/lib/auth";
import { BrandCover } from "@/components/app/BrandCover";
import { Briefcase } from "lucide-react";

export const Route = createFileRoute("/app/campaigns")({
  head: () => ({ meta: [{ title: "My Campaigns — Campayn" }] }),
  component: MyCampaigns,
});

const TABS: { v: string; l: string; statuses: string[] }[] = [
  { v: "active", l: "Active", statuses: ["applied","approved","script_submitted","script_approved","revision_requested","video_submitted","video_approved","posted"] },
  { v: "paid", l: "Paid", statuses: ["verified","paid","withdrawn"] },
  { v: "rejected", l: "Rejected", statuses: ["rejected"] },
];

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  applied:            { label: "Applied",              cls: "status-applied" },
  approved:           { label: "Approved · submit script", cls: "status-approved" },
  script_submitted:   { label: "Script in review",     cls: "status-pending" },
  script_approved:    { label: "Script approved · post", cls: "status-approved" },
  revision_requested: { label: "Revision requested",   cls: "status-pending" },
  video_submitted:    { label: "Submitted",            cls: "status-pending" },
  video_approved:     { label: "Video approved",       cls: "status-approved" },
  posted:             { label: "Posted · verifying",   cls: "status-pending" },
  verified:           { label: "Verified",             cls: "status-paid" },
  paid:               { label: "Paid",                 cls: "status-paid" },
  withdrawn:          { label: "Withdrawn",            cls: "status-paid" },
  rejected:           { label: "Rejected",             cls: "status-rejected" },
};

function MyCampaigns() {
  const [tab, setTab] = useState("active");
  const [items, setItems] = useState<any[] | null>(null);

  useEffect(() => {
    supabase.from("applications")
      .select("*, campaigns(*)")
      .order("applied_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  const cur = TABS.find(t => t.v === tab)!;
  const filtered = items?.filter(a => cur.statuses.includes(a.status));
  const counts = Object.fromEntries(TABS.map(t => [t.v, items?.filter(a => t.statuses.includes(a.status)).length ?? 0]));

  return (
    <div className="px-5 pt-8">
      <h1 className="text-[28px] font-black tracking-tight">My Campaigns</h1>
      <p className="text-sm text-muted-foreground mt-1">Track every brief from apply to paid.</p>

      <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {TABS.map(t => {
          const active = tab === t.v;
          return (
            <button
              key={t.v}
              onClick={() => setTab(t.v)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(59,79,228,0.25)]"
                  : "bg-white border border-border text-muted-foreground"
              }`}
            >
              {t.l} <span className={`ml-1 ${active ? "opacity-90" : "opacity-60"}`}>{counts[t.v]}</span>
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
          const s = STATUS_MAP[a.status] ?? { label: a.status, cls: "status-applied" };
          return (
            <li key={a.id}>
              <Link
                to="/app/application/$id"
                params={{ id: a.id }}
                className="cmp-card block active:scale-[0.99] transition"
              >
                <div className="flex">
                  <div className="w-24 shrink-0">
                    <BrandCover
                      brandName={c?.brand_name ?? "Brand"}
                      brandLogoUrl={c?.brand_logo_url}
                      coverUrl={c?.cover_image_url}
                      height={112}
                    />
                  </div>
                  <div className="flex-1 min-w-0 p-3.5">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{c?.brand_name}</div>
                    <div className="font-semibold text-[14px] leading-snug mt-0.5 line-clamp-2">{c?.title}</div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className={`status ${s.cls}`}>{s.label}</span>
                      <span className="coin-pill">{inrFmt(a.final_earning_inr ?? a.estimated_earning_inr)}</span>
                    </div>
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
