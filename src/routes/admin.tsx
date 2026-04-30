import { createFileRoute, Outlet, Link, Navigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Campayn" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading } = useAuth();
  const [check, setCheck] = useState<"pending" | "ok" | "deny">("pending");
  const loc = useLocation();

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setCheck(data ? "ok" : "deny"));
  }, [user]);

  if (loading || check === "pending") return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" />;
  if (check === "deny") return (
    <div className="min-h-screen grid place-items-center text-center px-6">
      <div>
        <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto" />
        <h1 className="mt-3 text-xl font-black">Admins only</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ask an existing admin to grant you the role.</p>
        <Link to="/app/discover" className="mt-5 inline-block bg-secondary px-4 py-2 rounded-xl text-sm font-semibold">Back to app</Link>
      </div>
    </div>
  );

  const tabs = [
    { to: "/admin", label: "Dashboard", exact: true },
    { to: "/admin/campaigns", label: "Campaigns" },
    { to: "/admin/applications", label: "Applications" },
    { to: "/admin/withdrawals", label: "Withdrawals" },
  ] as const;

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-6 pb-3 border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="font-black text-lg">⚡ Campayn Admin</div>
          <Link to="/app/discover" className="text-xs text-muted-foreground">Back to app</Link>
        </div>
        <nav className="max-w-3xl mx-auto mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map(t => {
            const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
            return <Link key={t.to} to={t.to} className={`chip whitespace-nowrap ${active ? "ring-2 ring-coin text-coin" : ""}`}>{t.label}</Link>;
          })}
        </nav>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-6"><Outlet /></main>
    </div>
  );
}