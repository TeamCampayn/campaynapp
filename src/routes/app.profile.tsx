import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Settings, Instagram, Youtube, ChevronRight, ShieldCheck, Gift, LifeBuoy, Lock, LogOut } from "lucide-react";
import { inrFmt } from "@/lib/auth";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile - Campayn" }] }),
  component: Profile,
});

function CoinIcon({ size = 18 }: { size?: number }) {
  return (
    <span aria-hidden style={{
      width: size, height: size, borderRadius: "50%",
      background: "radial-gradient(circle at 35% 30%, #F6D27A 0%, #D9A327 55%, #8C6510 100%)",
      display: "inline-block", flexShrink: 0,
      boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.25)",
    }} />
  );
}

function Profile() {
  const [p, setP] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ campaigns: 0, followers: 0, avgViews: 0, reliability: 0 });
  const [socials, setSocials] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const [{ data }, { data: roles }, { count: cCount }, { data: s }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("social_connections").select("*").eq("user_id", user.id),
      ]);
      setP(data);
      setIsAdmin(!!roles?.some((r: any) => r.role === "admin"));
      setSocials(s ?? []);
      const followers = (s ?? []).reduce((sum, c: any) => sum + (c.followers || 0), 0);
      const avgViews = (s ?? []).length ? Math.round((s as any[]).reduce((sum, c) => sum + (c.avg_views || 0), 0) / (s as any[]).length) : 0;
      setStats({ campaigns: cCount ?? 0, followers, avgViews, reliability: data?.profile_completion ?? 0 });
    });
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    window.location.href = "/";
  }

  const compact = (n: number) => n >= 1000 ? (n/1000).toFixed(1).replace(/\.0$/,"") + "K" : String(n);
  const completion = p?.profile_completion ?? 0;
  const missing: string[] = [];
  if (socials.length === 0) missing.push("Connect a platform");
  if (!p?.kyc_done) missing.push("Complete KYC");
  if (!p?.city) missing.push("Add your city");

  const ig = socials.find(s => s.platform === "instagram");
  const yt = socials.find(s => s.platform === "youtube");

  return (
    <div className="px-5 pt-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-black tracking-tight">Profile</h1>
        <div className="flex gap-2">
          <Link to="/app/edit-profile" className="h-10 w-10 rounded-full bg-secondary grid place-items-center text-primary">
            <Pencil className="h-4 w-4" />
          </Link>
          <Link to="/app/settings" className="h-10 w-10 rounded-full bg-secondary grid place-items-center text-primary">
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Identity */}
      <div className="mt-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl grad-primary grid place-items-center text-white font-black text-2xl shadow-[0_8px_24px_rgba(60,76,226,0.25)]">
          {(p?.display_name ?? "C").slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="text-[20px] font-black leading-tight">{p?.display_name ?? "Creator"}</div>
          <div className="text-[13px] text-muted-foreground">{p?.city || "India"} · Creator</div>
        </div>
      </div>

      {/* Profile completion card */}
      <div className="mt-5 rounded-2xl p-4" style={{ background: "var(--secondary)" }}>
        <div className="flex items-center justify-between">
          <div className="font-bold text-[14.5px]">Profile {completion}% complete</div>
          <div className="text-[12.5px] font-bold text-primary inline-flex items-center gap-1">
            +50 coins on 100% <CoinIcon size={14} />
          </div>
        </div>
        {missing.length > 0 && (
          <div className="mt-2 text-[13px] text-[#5B5F80]">
            Missing: {missing.join(", ")}
          </div>
        )}
        <div className="mt-3 h-1.5 bg-white/70 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${completion}%` }} />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Followers" value={stats.followers ? compact(stats.followers) : "0"} />
        <Stat label="Avg Views" value={stats.avgViews ? compact(stats.avgViews) : "0"} />
        <Stat label="Reliability" value={`${stats.reliability}%`} />
      </div>

      {/* Lifetime earnings banner */}
      <div className="mt-4 rounded-2xl p-4 border" style={{ background:"linear-gradient(180deg,#FBF6E8 0%,#F8EDD3 100%)", borderColor:"#EFD9A0" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12.5px] text-[#7A5A1F] font-medium">Lifetime earned on Campayn</div>
            <div className="mt-1 inline-flex items-center gap-2">
              <span className="text-[24px] font-black text-foreground">{inrFmt(p?.lifetime_earnings ?? 0)}</span>
              <CoinIcon size={20} />
            </div>
          </div>
          <div className="text-right">
            <div className="text-[12.5px] text-[#7A5A1F] font-medium">Campaigns</div>
            <div className="mt-1 text-[24px] font-black text-foreground">{stats.campaigns}</div>
          </div>
        </div>
      </div>

      {/* Platform connections */}
      <div className="mt-4 cmp-card p-4">
        <div className="font-bold text-[15px]">Platform Connections</div>
        <PlatformRow icon={<Instagram className="h-4 w-4" />} name="Instagram"
          conn={ig} bg="linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)" />
        <PlatformRow icon={<Youtube className="h-4 w-4" />} name="YouTube"
          conn={yt} bg="#FF0000" />
      </div>

      {/* Quick links */}
      <ul className="mt-4 space-y-2">
        <NavRow to="/app/kyc" icon={ShieldCheck} label="KYC verification" />
        <NavRow to="/app/referrals" icon={Gift} label="Refer & earn" />
        <NavRow to="/app/support" icon={LifeBuoy} label="Help & support" />
        {isAdmin && (
          <li>
            <Link to="/admin" className="cmp-card p-4 flex items-center gap-3 active:scale-[0.99] transition">
              <div className="h-10 w-10 rounded-xl grad-primary grid place-items-center"><Lock className="h-4 w-4 text-white" /></div>
              <div className="flex-1 font-semibold text-[14px]">Admin panel</div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        )}
      </ul>

      <button onClick={signOut} className="mt-5 w-full bg-white border border-border rounded-2xl py-3.5 font-semibold text-destructive inline-flex items-center justify-center gap-2 active:scale-[0.99] transition">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
      <p className="mt-6 text-center text-xs text-muted-foreground">Campayn v1.0 · Made in India 🇮🇳</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="cmp-card text-center py-4">
      <div className="text-[20px] font-black text-foreground">{value}</div>
      <div className="text-[12px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function PlatformRow({ icon, name, conn, bg }: { icon: React.ReactNode; name: string; conn: any; bg: string }) {
  return (
    <Link to="/app/connected" className="mt-3 flex items-center gap-3 active:opacity-80">
      <span className="h-10 w-10 rounded-xl grid place-items-center text-white" style={{ background: bg }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px]">{name}</div>
        <div className="text-[12px] text-muted-foreground truncate">
          {conn ? (conn.handle ? `@${conn.handle}` : "Connected") : "Not connected"}
        </div>
      </div>
      {conn ? (
        <span className="text-[11px] font-semibold text-success px-2.5 py-1 rounded-full" style={{ background:"rgba(33,196,93,0.12)" }}>Connected</span>
      ) : (
        <span className="text-[11px] font-semibold text-primary px-3 py-1 rounded-full bg-secondary">Connect</span>
      )}
    </Link>
  );
}

function NavRow({ to, icon: Icon, label }: { to: any; icon: any; label: string }) {
  return (
    <li>
      <Link to={to} className="cmp-card p-4 flex items-center gap-3 active:scale-[0.99] transition">
        <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center"><Icon className="h-4 w-4 text-primary" /></div>
        <div className="flex-1 font-semibold text-[14px]">{label}</div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </li>
  );
}
