import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Award, TrendingUp, Sparkles, ShieldCheck, Eye, Zap, Trophy } from "lucide-react";

export const Route = createFileRoute("/app/score")({
  head: () => ({ meta: [{ title: "Campayn Score - Campayn" }] }),
  component: ScorePage,
});

function ScorePage() {
  const [p, setP] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setP(data);
    });
  }, []);

  const score = p?.campayn_score ?? 0;
  const b = (p?.score_breakdown ?? {}) as Record<string, any>;
  const tier = score >= 800 ? "Legend" : score >= 600 ? "Pro" : score >= 400 ? "Rising" : score >= 200 ? "Rookie+" : "Rookie";
  const pct = Math.min(100, score / 10);

  // Radial gauge math
  const R = 78, C = 2 * Math.PI * R;
  const dash = (pct / 100) * C;

  const components = [
    { icon: Trophy,     label: "Campaigns done",    value: b.campaigns_done ?? 0,        max: 25,  pts: Math.min(200, (b.campaigns_done ?? 0) * 8),                color: "#3C4CE2" },
    { icon: ShieldCheck,label: "Reliability",       value: `${b.reliability_pct ?? 0}%`, max: 100, pts: Math.min(200, Math.round((b.reliability_pct ?? 0) * 2)),  color: "#21C45D" },
    { icon: Zap,        label: "Engagement rate",   value: `${b.engagement_rate_pct ?? 0}%`, max: 20, pts: Math.min(200, Math.round((b.engagement_rate_pct ?? 0) * 10)), color: "#F0AC00" },
    { icon: Eye,        label: "Avg views tier",    value: `${(b.avg_views ?? 0).toLocaleString("en-IN")}`, max: 250000, pts: b.avg_views_tier_pts ?? 0,           color: "#8B5CF6" },
    { icon: Sparkles,   label: "Content quality",   value: `${Math.round(((b.content_quality_pts ?? 0) / 200) * 100)}%`, max: 100, pts: b.content_quality_pts ?? 0, color: "#EC4899" },
  ];

  return (
    <div className="pb-10">
      {/* Hero */}
      <div className="mesh-bg pt-6 pb-8 px-5 relative overflow-hidden">
        <Link to="/app/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <span className="chip-glass"><Award className="h-3 w-3 text-primary" /> Campayn Score</span>
            <h1 className="mt-2 text-[26px] font-extrabold tracking-tight">Your creator credit score</h1>
          </div>
        </div>

        <div className="mt-5 mx-auto w-fit relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3C4CE2" />
                <stop offset="60%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#F0ABFC" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(60,76,226,0.10)" strokeWidth="14" />
            <circle cx="100" cy="100" r={R} fill="none" stroke="url(#g1)" strokeWidth="14"
              strokeDasharray={`${dash} ${C - dash}`} strokeLinecap="round"
              transform="rotate(-90 100 100)" style={{ transition: "stroke-dasharray 800ms ease" }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-[44px] font-black leading-none">{score}</div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">/ 1000</div>
              <div className="mt-2 text-[12px] font-bold px-2.5 py-1 rounded-full inline-block text-white"
                style={{ background: "linear-gradient(135deg,#3C4CE2,#8B5CF6)" }}>{tier}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Components */}
      <div className="px-5 mt-6">
        <h2 className="text-[15px] font-bold mb-3">How it's calculated</h2>
        <div className="space-y-2.5">
          {components.map((c) => {
            const wPct = Math.min(100, (c.pts / 200) * 100);
            return (
              <div key={c.label} className="cmp-card p-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl grid place-items-center" style={{ background: c.color + "1A", color: c.color }}>
                    <c.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <div className="font-semibold text-[14px]">{c.label}</div>
                      <div className="ml-auto text-[12px] font-bold text-foreground">{c.pts}<span className="text-muted-foreground font-medium">/200</span></div>
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">{String(c.value)}</div>
                    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${wPct}%`, background: c.color }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formula */}
      <div className="px-5 mt-6">
        <div className="cmp-card p-4">
          <div className="font-bold text-[15px] inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> The formula
          </div>
          <p className="mt-2 text-[13.5px] text-muted-foreground leading-relaxed">
            Each component contributes up to 200 points. Total = Campaigns × 8 + Reliability × 2 + Engagement × 10 + Avg-views tier + Content quality. Capped at 1000.
          </p>
          <ul className="mt-3 space-y-1.5 text-[12.5px] text-muted-foreground">
            <li>• Higher score = priority access to premium brands.</li>
            <li>• Score updates automatically when you finish or skip campaigns.</li>
            <li>• Above 600 unlocks early-access drops & advance pay.</li>
          </ul>
        </div>
      </div>

      {/* How to improve */}
      <div className="px-5 mt-5">
        <h2 className="text-[15px] font-bold mb-3">Boost your score</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { i: TrendingUp, t: "Finish 3 more", d: "Each completed = +8 pts" },
            { i: ShieldCheck, t: "Hit deadlines", d: "0 cancels keeps reliability max" },
            { i: Zap, t: "Boost engagement", d: "Hooks > flat openings" },
            { i: Sparkles, t: "Submit clean scripts", d: "Less revisions = more pts" },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="cmp-card p-3.5">
              <div className="h-8 w-8 rounded-lg grad-primary grid place-items-center"><Icon className="h-4 w-4 text-white" /></div>
              <div className="mt-2 font-semibold text-[13.5px]">{t}</div>
              <div className="text-[12px] text-muted-foreground">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}