import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/app/BottomNav";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" />;
  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-md mx-auto w-full">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
