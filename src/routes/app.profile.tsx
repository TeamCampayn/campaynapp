import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronRight, UserCog, Link2, ShieldCheck, Gift, Settings, LifeBuoy, Lock, LogOut } from "lucide-react";
import { inrFmt } from "@/lib/auth";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — Campayn" }] }),
  component: Profile,
});

function Profile() {
  const [p, setP] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<{ campaigns: number; socials: number }>({ campaigns: 0, socials: 0 });
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const [{ data }, { data: roles }, { count: cCount }, { count: sCount }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("social_connections").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setP(data);
      setIsAdmin(!!roles?.some((r: any) => r.role === "admin"));
      setStats({ campaigns: cCount ?? 0, socials: sCount ?? 0 });
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
    <div className="px-5 pt-8 pb-8">
      <h1 className="text-[28px] font-black tracking-tight">Profile</h1>

      {/* Hero card — avatar + identity + lifetime earnings */}
      <div className="mt-5 cmp-card p-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl grad-primary grid place-items-center text-2xl font-black text-primary-foreground ring-primary">
            {(p?.display_name ?? "C").slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-black truncate">{p?.display_name ?? "Creator"}</div>
            {p?.city && <div className="text-xs text-muted-foreground">📍 {p.city}</div>}
            <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="font-mono font-semibold text-foreground">{p?.referral_code ?? "—"}</span>
              <span>· referral code</span>
            </div>
          </div>
        </div>
        {p?.bio && <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{p.bio}</p>}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Lifetime" value={inrFmt(p?.lifetime_earnings ?? 0)} accent />
          <Stat label="Campaigns" value={String(stats.campaigns)} />
          <Stat label="Socials" value={String(stats.socials)} />
        </div>
      </div>

      {/* Profile completion */}
      <div className="mt-4 cmp-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Profile completion</div>
          <div className="text-sm font-bold">{p?.profile_completion ?? 20}%</div>
        </div>
        <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${p?.profile_completion ?? 20}%` }} />
        </div>
        {(p?.profile_completion ?? 20) < 100 && (
          <Link to="/app/edit-profile" className="mt-3 inline-block text-xs font-semibold text-primary">Complete profile →</Link>
        )}
      </div>

      <ul className="mt-5 space-y-2">
        {items.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <Link to={to} className="cmp-card p-4 flex items-center gap-3 active:scale-[0.99] transition">
              <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center"><Icon className="h-4 w-4 text-primary" /></div>
              <div className="flex-1 font-semibold text-[14px]">{label}</div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
        {isAdmin && (
          <li>
            <Link to="/admin" className="cmp-card p-4 flex items-center gap-3 active:scale-[0.99] transition border border-coin/30">
              <div className="h-10 w-10 rounded-xl grad-coin grid place-items-center"><Lock className="h-4 w-4 text-coin-foreground" /></div>
              <div className="flex-1 font-semibold text-[14px]">Admin panel</div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        )}
      </ul>

      <button onClick={signOut} className="mt-6 w-full bg-white border border-border rounded-2xl py-3.5 font-semibold text-destructive inline-flex items-center justify-center gap-2 active:scale-[0.99] transition">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
      <p className="mt-6 text-center text-xs text-muted-foreground">Campayn v1.0 · Made in India 🇮🇳</p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-secondary/60 rounded-xl px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className={`mt-0.5 font-black text-[15px] truncate ${accent ? "text-coin" : "text-foreground"}`}>{value}</div>
    </div>
  );
}