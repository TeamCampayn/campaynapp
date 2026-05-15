import { createFileRoute, Outlet, Link, Navigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin - Campayn" }] }),
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

  const tabs: { to: "/admin" | "/admin/campaigns" | "/admin/applications" | "/admin/withdrawals"; label: string; exact?: boolean }[] = [
    { to: "/admin", label: "Dashboard", exact: true },
    { to: "/admin/campaigns", label: "Campaigns" },
    { to: "/admin/applications", label: "Applications" },
    { to: "/admin/withdrawals", label: "Withdrawals" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-5 pt-5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg grad-primary grid place-items-center text-primary-foreground font-black">C</div>
            <div>
              <div className="font-black text-[15px] leading-none">Campayn Admin</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Internal console</div>
            </div>
          </div>
          <Link to="/app/discover" className="text-xs font-semibold text-primary">← Back to app</Link>
        </div>
        <nav className="max-w-4xl mx-auto px-5 pb-1 flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map(t => {
            const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
            return (
              <Link key={t.to} to={t.to}
                className={`whitespace-nowrap px-3 py-2.5 text-[13px] font-semibold border-b-2 transition ${
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-4xl mx-auto px-5 py-6"><Outlet /></main>
    </div>
  );
}