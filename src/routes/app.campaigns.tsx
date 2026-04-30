import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { inrFmt } from "@/lib/auth";

export const Route = createFileRoute("/app/campaigns")({
  head: () => ({ meta: [{ title: "My Campaigns — Campayn" }] }),
  component: MyCampaigns,
});

const TABS: { v: string; l: string; statuses: string[] }[] = [
  { v: "active", l: "Active", statuses: ["applied","approved","script_submitted","script_approved","revision_requested","video_submitted","video_approved","posted"] },
  { v: "paid", l: "Paid", statuses: ["verified","paid","withdrawn"] },
  { v: "rejected", l: "Rejected", statuses: ["rejected"] },
];

const STATUS_LABEL: Record<string, string> = {
  applied: "Applied",
  approved: "Approved · submit script",
  script_submitted: "Script in review",
  script_approved: "Script approved · post",
  revision_requested: "Revision requested",
  video_submitted: "Submitted",
  video_approved: "Video approved",
  posted: "Posted · awaiting verification",
  verified: "Verified",
  paid: "Paid",
  withdrawn: "Withdrawn",
  rejected: "Rejected",
};

function MyCampaigns() {
  const [tab, setTab] = useState("active");
  const [items, setItems] = useState<any[] | null>(null);

  useEffect(() => {
    supabase.from("applications").select("*, campaigns(*)").order("applied_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  const cur = TABS.find(t => t.v === tab)!;
  const filtered = items?.filter(a => cur.statuses.includes(a.status));

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-black tracking-tight">My Campaigns</h1>
      <div className="mt-5 flex gap-2">
        {TABS.map(t => (
          <button key={t.v} onClick={() => setTab(t.v)}
            className={`chip ${tab === t.v ? "ring-2 ring-coin text-coin" : ""}`}>{t.l}</button>
        ))}
      </div>
      {filtered === undefined && <div className="mt-6 space-y-3">{[1,2].map(i => <div key={i} className="h-24 rounded-2xl glass-card animate-pulse" />)}</div>}
      {filtered?.length === 0 && <p className="mt-10 text-center text-muted-foreground text-sm">Nothing here yet. Apply from Discover.</p>}
      <ul className="mt-5 space-y-3">
        {filtered?.map(a => (
          <li key={a.id}>
            <Link to="/app/application/$id" params={{ id: a.id }} className="block glass-card rounded-2xl p-4 active:scale-[0.99] transition">
              <div className="flex items-start gap-3">
                {a.campaigns?.brand_logo_url && <img src={a.campaigns.brand_logo_url} className="h-10 w-10 rounded-lg bg-white object-contain p-1" />}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15px] truncate">{a.campaigns?.title}</div>
                  <div className="text-xs text-muted-foreground">{a.campaigns?.brand_name}</div>
                  <div className="mt-2 chip">{STATUS_LABEL[a.status] ?? a.status}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-muted-foreground">Earn</div>
                  <div className="text-coin font-black">{inrFmt(a.final_earning_inr ?? a.estimated_earning_inr)}</div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}