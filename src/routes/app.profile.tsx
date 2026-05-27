import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Settings, Instagram, Youtube, ChevronRight, ShieldCheck, Gift, LifeBuoy, Lock, LogOut, TrendingUp, Award, Eye, Play } from "lucide-react";
import { inrFmt } from "@/lib/auth";
import { RupeeCoin } from "@/components/app/RupeeCoin";
import { NotificationsBell } from "@/components/app/NotificationsBell";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile - Campayn" }] }),
  component: Profile,
});

function Profile() {
  const [p, setP] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ campaigns: 0, followers: 0, avgViews: 0, reliability: 0 });
  const [socials, setSocials] = useState<any[]>([]);
  const [kycStatus, setKycStatus] = useState<string>("not_started");
  const [posts, setPosts] = useState<any[]>([]);
  const [earningsSeries, setEarningsSeries] = useState<number[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const [{ data }, { data: roles }, { count: cCount }, { data: s }, { data: k }, { data: pp }, { data: tx }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("social_connections").select("*").eq("user_id", user.id),
        supabase.from("kyc").select("status").eq("user_id", user.id).maybeSingle(),
        supabase.from("applications").select("id, post_url, verified_views, final_earning_inr, estimated_earning_inr, posted_at, status, campaigns:legacy_campaigns(title, brand_name, brand_logo_url, cover_image_url)").eq("user_id", user.id).in("status", ["posted","verified","paid","withdrawn"]).order("posted_at", { ascending: false }).limit(12),
        supabase.from("transactions").select("amount_inr, created_at, kind").eq("user_id", user.id).eq("kind","earning").order("created_at", { ascending: true }),
      ]);
      setP(data);
      setIsAdmin(!!roles?.some((r: any) => r.role === "admin"));
      setSocials(s ?? []);
      setKycStatus((k?.status as string) ?? "not_started");
      setPosts(pp ?? []);
      // bucket earnings into last 8 weeks for sparkline
      const now = Date.now(); const buckets = new Array(8).fill(0);
      (tx ?? []).forEach((t: any) => {
        const w = Math.floor((now - new Date(t.created_at).getTime()) / (7*86400000));
        if (w >= 0 && w < 8) buckets[7-w] += (t.amount_inr || 0);
      });
      setEarningsSeries(buckets);
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
  const kycVerified = kycStatus === "verified";
  // Recompute completion from real signals so verified creators stop seeing nags
  const checks = [
    !!p?.display_name,
    !!p?.city,
    socials.length > 0,
    kycVerified,
    !!(p?.niches && p.niches.length > 0),
  ];
  const completion = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const missing: string[] = [];
  if (socials.length === 0) missing.push("Connect a platform");
  if (!kycVerified) missing.push(kycStatus === "submitted" ? "KYC under review" : "Complete KYC");
  if (!p?.city) missing.push("Add your city");
  if (!p?.niches || p.niches.length === 0) missing.push("Pick your niches");

  const ig = socials.find(s => s.platform === "instagram");
  const yt = socials.find(s => s.platform === "youtube");
  const score = p?.campayn_score ?? 0;
  const tier = score >= 800 ? "Legend" : score >= 600 ? "Pro" : score >= 400 ? "Rising" : score >= 200 ? "Rookie+" : "Rookie";
  const eng = ig?.engagement_rate ? Number(ig.engagement_rate).toFixed(1) + "%" : "-";

  return (
    <div className="px-5 pt-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-black tracking-tight">Profile</h1>
        <div className="flex gap-2 items-center">
          <NotificationsBell />
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

      {/* Campayn Score */}
      <Link to="/app/score" className="mt-5 block rounded-2xl p-4 grad-coin text-white relative overflow-hidden active:scale-[0.99] transition">
        <Award className="absolute -right-3 -bottom-3 h-28 w-28 opacity-15" strokeWidth={1.4} />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-widest font-bold opacity-80 inline-flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5" /> Campayn Score · tap for details
          </div>
          <div className="mt-1.5 flex items-end gap-2">
            <div className="text-[40px] leading-none font-black">{score}</div>
            <div className="text-sm font-semibold opacity-80 mb-1">/ 1000</div>
            <div className="ml-auto text-[12.5px] font-bold bg-white/20 px-2.5 py-1 rounded-full">{tier}</div>
          </div>
          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${Math.min(100, score / 10)}%` }} />
          </div>
          <div className="mt-2 text-[11.5px] opacity-85">Higher score = priority on premium campaigns</div>
        </div>
      </Link>

      {/* Profile completion card */}
      <div className="mt-5 rounded-2xl p-4" style={{ background: "var(--secondary)" }}>
        <div className="flex items-center justify-between">
          <div className="font-bold text-[14.5px]">Profile {completion}% complete</div>
          <div className="text-[12.5px] font-bold text-primary inline-flex items-center gap-1">
            +50 coins on 100% <RupeeCoin size={14} />
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
      <div className="mt-4 grid grid-cols-4 gap-2.5">
        <Stat label="Followers" value={stats.followers ? compact(stats.followers) : "0"} />
        <Stat label="Avg Views" value={stats.avgViews ? compact(stats.avgViews) : "0"} />
        <Stat label="Engagement" value={eng} />
        <Stat label="Campaigns" value={String(stats.campaigns)} />
      </div>

      {/* Lifetime earnings banner */}
      <div className="mt-4 rounded-2xl p-4 border" style={{ background:"var(--secondary)", borderColor:"#DDDEF8" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12.5px] text-[#3A3F70] font-medium">Lifetime earned on Campayn</div>
            <div className="mt-1 inline-flex items-center gap-2">
              <RupeeCoin size={20} />
              <span className="text-[24px] font-black text-foreground">{inrFmt(p?.lifetime_earnings ?? 0)}</span>
            </div>
          </div>
          <Sparkline data={earningsSeries} />
        </div>
      </div>

      {/* Posted content gallery */}
      {posts.length > 0 && (
        <div className="mt-5">
          <div className="flex items-end justify-between mb-2.5">
            <h3 className="font-black text-[16px]">My posts</h3>
            <span className="text-[12px] text-muted-foreground">{posts.length} live</span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
            {posts.map(po => (
              <a key={po.id} href={po.post_url || "#"} target="_blank" rel="noreferrer"
                 className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary group active:scale-[0.98] transition">
                {po.campaigns?.cover_image_url
                  ? <img src={po.campaigns.cover_image_url} className="absolute inset-0 h-full w-full object-cover" />
                  : <div className="absolute inset-0 grad-primary" />}
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/75" />
                <Play className="absolute top-2 right-2 h-4 w-4 text-white/90 drop-shadow" />
                <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white">
                  <div className="text-[10px] opacity-85 truncate font-semibold">{po.campaigns?.brand_name}</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold">
                      <Eye className="h-2.5 w-2.5" /> {compact(po.verified_views ?? 0)}
                    </span>
                    <span className="text-[10.5px] font-black">₹{inrFmt(po.final_earning_inr ?? po.estimated_earning_inr ?? 0).replace("₹","")}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 cmp-card p-4">
        <div className="font-bold text-[15px]">Platform Connections</div>
        <div className="md:grid md:grid-cols-2 md:gap-4">
          <PlatformRow icon={<Instagram className="h-4 w-4" />} name="Instagram"
            conn={ig} bg="linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)" />
          <PlatformRow icon={<Youtube className="h-4 w-4" />} name="YouTube"
            conn={yt} bg="#FF0000" />
        </div>
      </div>

      {/* Quick links */}
      <ul className="mt-4 space-y-2 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
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

      <button onClick={signOut} className="mt-6 md:mt-8 w-full md:w-auto md:px-12 bg-white border border-border rounded-2xl py-3.5 font-semibold text-destructive inline-flex items-center justify-center gap-2 active:scale-[0.99] transition">
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

function Sparkline({ data }: { data: number[] }) {
  const w = 96, h = 40, pad = 3;
  const max = Math.max(1, ...data);
  const step = data.length > 1 ? (w - pad*2) / (data.length - 1) : 0;
  const pts = data.map((v, i) => `${pad + i*step},${h - pad - (v/max)*(h - pad*2)}`).join(" ");
  const area = `M ${pad},${h-pad} L ${pts.split(" ").join(" L ")} L ${w-pad},${h-pad} Z`;
  if (!data.some(v => v > 0)) {
    return <TrendingUp className="h-10 w-10 text-primary" />;
  }
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark)" />
      <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
