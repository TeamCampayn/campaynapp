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
  if (!stats) return <p className="text-muted-foreground">Loading…</p>;
  const cards = [
    { l: "Creators", v: stats.users },
    { l: "Active campaigns", v: stats.campaigns },
    { l: "GMV (committed)", v: inrFmt(stats.gmv) },
    { l: "Pending withdrawals", v: inrFmt(stats.pendingWd) },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(c => (
        <div key={c.l} className="glass-card rounded-2xl p-4">
          <div className="text-xs uppercase text-muted-foreground">{c.l}</div>
          <div className="mt-1 font-black text-xl text-coin">{c.v}</div>
        </div>
      ))}
    </div>
  );
}