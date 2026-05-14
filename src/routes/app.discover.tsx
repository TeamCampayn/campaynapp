import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Search, Filter } from "lucide-react";
import { CampaignCard, CampaignCardMini, type CampaignCardData } from "@/components/app/CampaignCard";

export const Route = createFileRoute("/app/discover")({
  head: () => ({ meta: [{ title: "Discover — Campayn" }]}),
  component: Discover,
});

function Discover() {
  const [items, setItems] = useState<CampaignCardData[] | null>(null);
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [avgViews, setAvgViews] = useState<number>(50000);
  const [q, setQ] = useState("");
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
    return items.filter(c => {
      if (filter !== "all" && c.platform !== filter && c.platform !== "both") return false;
      if (q && !`${c.title} ${c.brand_name} ${c.tagline ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, q, filter]);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-3 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-[13px] text-muted-foreground">Namaste, {profile?.display_name ?? "creator"} 👋</div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-foreground leading-tight mt-0.5">Discover</h1>
        </div>
        <div className="h-[42px] w-[42px] rounded-full grad-primary grid place-items-center text-white font-bold">
          {(profile?.display_name?.[0] ?? "C").toUpperCase()}
        </div>
      </div>

      {/* Search + filter */}
      <div className="px-5 pt-3.5 flex gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search campaigns…"
            className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-white border border-border text-[14px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
        <button className="h-11 w-11 grid place-items-center rounded-xl bg-white border border-border text-foreground relative">
          <Filter className="h-[18px] w-[18px]" />
          <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full" style={{ background:"#F4B400", border:"2px solid #fff" }} />
        </button>
      </div>

      {/* Category chips */}
      <div className="mt-3 px-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {[["all","All"],["instagram","Instagram"],["youtube","YouTube"]].map(([v,l]) => {
          const sel = filter === v;
          return (
            <button key={v} onClick={() => setFilter(v)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] border transition ${
                sel ? "bg-primary text-white border-primary font-semibold" : "bg-white text-foreground border-border font-medium"
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
        <div className="mt-2">
          <div className="px-5 flex items-baseline justify-between mb-2.5">
            <h2 className="text-[17px] font-semibold text-foreground">Top picks for you</h2>
            <span className="text-[11px] font-medium text-muted-foreground tracking-wider inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary-blue" /> AI-MATCHED
            </span>
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
        <div className="px-5 mt-2">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[17px] font-semibold text-foreground">All campaigns</h2>
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
