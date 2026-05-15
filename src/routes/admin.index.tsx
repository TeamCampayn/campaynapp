import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { inrFmt } from "@/lib/auth";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const [users, camps, apps, wd] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("applications").select("estimated_earning_inr"),
        supabase.from("withdrawals").select("amount_inr").eq("status", "pending"),
      ]);
      setStats({
        users: users.count ?? 0,
        campaigns: camps.count ?? 0,
        gmv: (apps.data ?? []).reduce((s: number, a: any) => s + (a.estimated_earning_inr || 0), 0),
        pendingWd: (wd.data ?? []).reduce((s: number, w: any) => s + (w.amount_inr || 0), 0),
      });
    })();
  }, []);
  if (!stats) return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1,2,3,4].map(i => <div key={i} className="h-24 cmp-card animate-pulse" />)}
    </div>
  );
  const cards = [
    { l: "Creators",            v: String(stats.users),       accent: "text-foreground" },
    { l: "Active campaigns",    v: String(stats.campaigns),   accent: "text-primary" },
    { l: "GMV (committed)",     v: inrFmt(stats.gmv),         accent: "text-coin" },
    { l: "Pending withdrawals", v: inrFmt(stats.pendingWd),   accent: "text-warning" },
  ];
  return (
    <div>
      <h2 className="text-[22px] font-black tracking-tight">Dashboard</h2>
      <p className="text-sm text-muted-foreground mt-0.5">Real-time platform health.</p>
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.l} className="cmp-card p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{c.l}</div>
            <div className={`mt-1.5 font-black text-2xl ${c.accent}`}>{c.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}