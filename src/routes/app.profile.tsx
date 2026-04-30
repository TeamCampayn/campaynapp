import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronRight, UserCog, Link2, ShieldCheck, Gift, Settings, LifeBuoy, Lock } from "lucide-react";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — Campayn" }] }),
  component: Profile,
});

function Profile() {
  const [p, setP] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setP(data);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      setIsAdmin(!!roles?.some((r: any) => r.role === "admin"));
    });
  }, []);
  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    window.location.href = "/";
  }

  const items = [
    { to: "/app/edit-profile", icon: UserCog, label: "Edit profile" },
    { to: "/app/connected", icon: Link2, label: "Connected accounts" },
    { to: "/app/kyc", icon: ShieldCheck, label: "KYC verification" },
    { to: "/app/referrals", icon: Gift, label: "Refer & earn" },
    { to: "/app/settings", icon: Settings, label: "Settings" },
    { to: "/app/support", icon: LifeBuoy, label: "Help & support" },
  ] as const;

  return (
    <div className="px-5 pt-8">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl grad-primary grid place-items-center text-2xl font-black text-primary-foreground">
          {(p?.display_name ?? "C").slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="text-xl font-black">{p?.display_name ?? "Creator"}</div>
          <div className="text-xs text-muted-foreground">Referral: {p?.referral_code ?? "—"}</div>
        </div>
      </div>
      <div className="mt-6 glass-card rounded-2xl p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Profile completion</div>
        <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full grad-coin" style={{ width: `${p?.profile_completion ?? 20}%` }} />
        </div>
        <div className="mt-2 text-sm">{p?.profile_completion ?? 20}% complete</div>
      </div>

      <ul className="mt-6 space-y-2">
        {items.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <Link to={to} className="glass-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99]">
              <div className="h-9 w-9 rounded-xl bg-secondary grid place-items-center"><Icon className="h-4 w-4" /></div>
              <div className="flex-1 font-semibold">{label}</div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
        {isAdmin && (
          <li>
            <Link to="/admin" className="glass-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] ring-2 ring-coin">
              <div className="h-9 w-9 rounded-xl grad-coin grid place-items-center"><Lock className="h-4 w-4 text-coin-foreground" /></div>
              <div className="flex-1 font-semibold">Admin panel</div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        )}
      </ul>

      <button onClick={signOut} className="mt-6 w-full bg-secondary text-secondary-foreground rounded-2xl py-3 font-semibold">
        Sign out
      </button>
      <p className="mt-6 text-center text-xs text-muted-foreground">Campayn v1.0 · Made in India 🇮🇳</p>
    </div>
  );
}