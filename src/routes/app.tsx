import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/app/BottomNav";
import { SideNav } from "@/components/app/SideNav";
import { RealtimeNotifier } from "@/components/app/RealtimeNotifier";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  const { user, loading } = useAuth();
  const [check, setCheck] = useState<"pending" | "ok" | "needs">(() => {
    return localStorage.getItem("campayn_onboarding_completed") === "true" ? "ok" : "pending";
  });

  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem("campayn_onboarding_completed") === "true") {
      setCheck("ok");
      return;
    }
    async function checkStatus() {
      try {
        const { data, error } = await supabase.from("profiles").select("onboarding_complete").eq("id", user!.id).maybeSingle();
        if (error) {
          console.error("Error checking onboarding status:", error);
          setCheck("needs");
        } else {
          if (data?.onboarding_complete) {
            localStorage.setItem("campayn_onboarding_completed", "true");
            setCheck("ok");
          } else {
            setCheck("needs");
          }
        }
      } catch (err) {
        console.error("Failed to check onboarding status:", err);
        setCheck("needs");
      }
    }
    checkStatus();
  }, [user]);

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" />;
  if (check === "pending") return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (check === "needs") return <Navigate to="/onboarding" />;

  return (
    <div className="flex min-h-screen bg-muted/10">
      <SideNav />
      <div className="flex-1 w-full pb-24 md:pb-0 overflow-x-hidden">
        <div className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto w-full min-h-screen">
          <Outlet />
        </div>
      </div>
      <BottomNav />
      <RealtimeNotifier user={user} />
    </div>
  );
}
