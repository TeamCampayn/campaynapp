import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Bell, Star } from "lucide-react";
import { CampaignCard, CampaignCardMini, type CampaignCardData } from "@/components/app/CampaignCard";

export const Route = createFileRoute("/app/discover")({
  head: () => ({ meta: [{ title: "Discover — Campayn" }]}),
  component: Discover,
});

function Discover() {
  const [items, setItems] = useState<CampaignCardData[] | null>(null);
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [avgViews, setAvgViews] = useState<number>(50000);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    supabase.from("campaigns").select("*").eq("status", "active").order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as CampaignCardData[]) ?? []));
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: p } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      setProfile(p);
      const { data: socials } = await supabase.from("social_connections").select("avg_views").eq("user_id", user.id);
      if (socials && socials.length) {
        const top = Math.max(...socials.map((s: any) => s.avg_views || 0));
        if (top > 0) setAvgViews(top);
      }
    });
  }, []);

  const filtered = useMemo(() => {
    if (!items) return null;
    const now = Date.now();
    return items.filter(c => {
      if (filter === "new") {
        const isNew = c.created_at ? now - new Date(c.created_at).getTime() < 1000 * 60 * 60 * 24 * 4 : false;
        if (!isNew) return false;
      } else if (filter === "high") {
        if (c.cpv_paise < 30) return false;
      } else if (filter === "closing") {
        const hours = c.deadline ? Math.ceil((new Date(c.deadline).getTime() - now) / 3600000) : null;
        if (hours === null || hours > 24) return false;
      }
      return true;
    });
  }, [items, filter]);

  const firstName = (profile?.display_name ?? "creator").split(" ")[0];

  return (
    <div className="pb-6">
      {/* Top brand bar */}
      <div className="px-5 pt-4 flex items-center justify-between">
        <div className="text-[22px] font-extrabold tracking-tight" style={{ color: "var(--primary)" }}>
          Campayn
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 grid place-items-center rounded-full bg-white border border-border">
            <Search className="h-[18px] w-[18px] text-foreground" />
          </button>
          <button className="relative h-10 w-10 grid place-items-center rounded-full bg-white border border-border">
            <Bell className="h-[18px] w-[18px] text-foreground" />
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full grad-primary grid place-items-center text-[9px] font-bold text-white">3</span>
          </button>
        </div>
      </div>

      <div className="border-b border-border mt-4" />

      {/* Greeting */}
      <div className="px-5 pt-5">
        <h1 className="text-[24px] font-extrabold tracking-tight text-foreground leading-tight">
          Hey {firstName}! <span aria-hidden>👋</span>
        </h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          {items?.length ?? 0} campaigns waiting for you
        </p>
      </div>

      {/* Filter chips */}
      <div className="mt-4 px-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {[["all","All"],["new","New"],["high","High Earning"],["closing","Closing Soon"]].map(([v,l]) => {
          const sel = filter === v;
          return (
            <button key={v} onClick={() => setFilter(v)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] transition ${
                sel
                  ? "bg-primary text-white font-semibold shadow-[0_6px_16px_rgba(60,76,226,0.25)]"
                  : "bg-white text-foreground border border-border font-medium"
              }`}>{l}</button>
          );
        })}
      </div>

      {/* Loading skeleton */}
      {items === null && (
        <div className="mt-5 px-5 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-56 rounded-2xl bg-white border border-border animate-pulse" />)}
        </div>
      )}

      {/* Top picks rail */}
      {items && items.length > 0 && (
        <div className="mt-5">
          <div className="px-5 flex items-center gap-1.5 mb-3">
            <Star className="h-[18px] w-[18px]" fill="#F0AC00" stroke="#F0AC00" />
            <h2 className="text-[17px] font-bold text-foreground">Top Picks for You</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-3">
            {items.slice(0, 5).map(c => (
              <CampaignCardMini key={c.id} c={c} avgViews={avgViews} />
            ))}
          </div>
        </div>
      )}

      {/* All campaigns */}
      {filtered && (
        <div className="px-5 mt-4">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[17px] font-bold text-foreground">All Campaigns</h2>
            <span className="text-[11px] font-medium text-muted-foreground">{filtered.length} live</span>
          </div>
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">No campaigns match. Try clearing filters.</div>
          ) : (
            <div className="space-y-3.5">
              {filtered.map(c => <CampaignCard key={c.id} c={c} avgViews={avgViews} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
