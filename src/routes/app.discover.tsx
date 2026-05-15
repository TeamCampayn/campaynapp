import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, X } from "lucide-react";
import { CampaignCard, CampaignCardMini, type CampaignCardData } from "@/components/app/CampaignCard";
import { NotificationsBell } from "@/components/app/NotificationsBell";

export const Route = createFileRoute("/app/discover")({
  head: () => ({ meta: [{ title: "Discover - Campayn" }]}),
  component: Discover,
});

function Discover() {
  const [items, setItems] = useState<(CampaignCardData & { target_niches: string[] })[] | null>(null);
  const [profile, setProfile] = useState<{ display_name: string | null; niches?: string[] | null } | null>(null);
  const [avgViews, setAvgViews] = useState<number>(50000);
  const [filter, setFilter] = useState<string>("all");
  const [niches, setNiches] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeNiches, setActiveNiches] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("campaigns").select("*").eq("status", "active").order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as CampaignCardData[]) ?? []));
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: p } = await supabase.from("profiles").select("display_name, niches").eq("id", user.id).maybeSingle();
      setProfile(p);
      setNiches(((p as any)?.niches ?? []) as string[]);
      const { data: socials } = await supabase.from("social_connections").select("avg_views").eq("user_id", user.id);
      if (socials && socials.length) {
        const top = Math.max(...socials.map((s: any) => s.avg_views || 0));
        if (top > 0) setAvgViews(top);
      }
    });
  }, []);

  // Personalized recommendations: niche overlap → tier → CPV
  const recommended = useMemo(() => {
    if (!items || items.length === 0) return [];
    const userN = (niches ?? []).map(n => n.toLowerCase());
    const scored = items.map(c => {
      const cN = (c.target_niches ?? []).map(n => n.toLowerCase());
      const overlap = userN.filter(n => cN.includes(n)).length;
      const matchPct = userN.length ? Math.round((overlap / Math.max(1, userN.length)) * 100) : 0;
      return { c, overlap, matchPct, cpv: c.cpv_paise };
    });
    scored.sort((a, b) => b.overlap - a.overlap || b.cpv - a.cpv);
    return scored.slice(0, 6);
  }, [items, niches]);

  const filtered = useMemo(() => {
    if (!items) return null;
    const now = Date.now();
    const q = query.trim().toLowerCase();
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
      if (activeNiches.length > 0) {
        const cN = (c.target_niches ?? []).map(n => n.toLowerCase());
        const hit = activeNiches.some(n => cN.includes(n.toLowerCase()));
        if (!hit) return false;
      }
      if (q) {
        const hay = `${c.title} ${c.brand_name} ${(c.target_niches ?? []).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, filter, query, activeNiches]);

  // All niches available across active campaigns, ranked by frequency
  const allNiches = useMemo(() => {
    if (!items) return [] as string[];
    const counts = new Map<string, number>();
    for (const c of items) for (const n of (c.target_niches ?? [])) counts.set(n, (counts.get(n) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a,b) => b[1] - a[1]).map(([n]) => n).slice(0, 16);
  }, [items]);

  function toggleNiche(n: string) {
    setActiveNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  }

  const firstName = (profile?.display_name ?? "creator").split(" ")[0];

  return (
    <div className="pb-6">
      {/* Mesh hero band */}
      <div className="relative mesh-bg pt-4 pb-5 overflow-hidden">
        <div className="px-5 flex items-center justify-between">
          <div className="text-[22px] font-extrabold tracking-tight" style={{ color: "var(--primary)" }}>
            campayn
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSearch(s => !s)}
              className={`h-10 w-10 grid place-items-center rounded-full glass ${showSearch ? "ring-2 ring-primary" : ""}`}
              aria-label="Search">
              <Search className="h-[18px] w-[18px] text-foreground" />
            </button>
            <NotificationsBell />
          </div>
        </div>

        {showSearch && (
          <div className="px-5 mt-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search brand, niche or keyword"
                className="w-full h-11 pl-10 pr-10 rounded-full glass text-[14px] outline-none focus:ring-2 focus:ring-primary" />
              {query && (
                <button onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-secondary grid place-items-center">
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="px-5 mt-4">
          <h1 className="text-[26px] font-extrabold tracking-tight text-foreground leading-tight">
            Hey {firstName},
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            Collaborate · Create · Collect
          </p>
        </div>

        {/* Filter chips */}
        <div className="mt-4 px-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[["all","All"],["new","New"],["high","High Earning"],["closing","Closing Soon"]].map(([v,l]) => {
            const sel = filter === v;
            return (
              <button key={v} onClick={() => setFilter(v)}
                className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition border ${
                  sel
                    ? "bg-primary text-white border-transparent shadow-[0_8px_22px_-8px_rgba(60,76,226,0.5)]"
                    : "bg-white/80 text-foreground border-border"
                }`}>
                {l}
              </button>
            );
          })}
        </div>

        {allNiches.length > 0 && (
          <div className="mt-2.5 px-5 flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {allNiches.map(n => {
              const sel = activeNiches.includes(n);
              return (
                <button key={n} onClick={() => toggleNiche(n)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition border
                    ${sel ? "bg-primary text-white border-transparent" : "bg-white/70 text-muted-foreground border-border hover:text-foreground"}`}>
                  {n.charAt(0).toUpperCase() + n.slice(1)}
                </button>
              );
            })}
            {activeNiches.length > 0 && (
              <button onClick={() => setActiveNiches([])}
                className="shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold text-destructive">
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {items === null && (
        <div className="mt-5 px-5 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-56 rounded-2xl bg-white border border-border animate-pulse" />)}
        </div>
      )}

      {/* Recommended for You rail */}
      {recommended.length > 0 && (
        <div className="mt-5">
          <div className="px-5 flex items-center gap-1.5 mb-3">
            <h2 className="text-[17px] font-bold text-foreground">Matched to your niche</h2>
            <span className="ml-auto text-[11px] text-muted-foreground">{recommended.length} picks</span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-3">
            {recommended.map(({ c, matchPct }) => (
              <div key={c.id} className="relative">
                {matchPct > 0 && (
                  <span className="absolute z-10 top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow"
                    style={{ background: "linear-gradient(135deg,#3C4CE2,#8B5CF6)" }}>
                    Match {matchPct}%
                  </span>
                )}
                <CampaignCardMini c={c} avgViews={avgViews} />
              </div>
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
