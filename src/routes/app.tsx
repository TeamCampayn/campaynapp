import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/app/BottomNav";
import { RealtimeNotifier } from "@/components/app/RealtimeNotifier";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  const { user, loading } = useAuth();
  const [check, setCheck] = useState<"pending" | "ok" | "needs">("pending");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("onboarding_complete").eq("id", user.id).maybeSingle()
      .then(({ data }) => setCheck(data?.onboarding_complete ? "ok" : "needs"));
  }, [user]);

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" />;
  if (check === "pending") return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (check === "needs") return <Navigate to="/onboarding" />;

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-md mx-auto w-full">
        <Outlet />
      </div>
      <BottomNav />
      <RealtimeNotifier user={user} />
    </div>
  );
}
