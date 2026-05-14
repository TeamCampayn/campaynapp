import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { inrFmt, compactFmt } from "@/lib/auth";
import { ArrowLeft, Check, X, Sparkles, Clock, Users, Loader2, Share2, Eye } from "lucide-react";
import { toast } from "sonner";
import { BrandCover } from "@/components/app/BrandCover";

export const Route = createFileRoute("/app/campaign/$id")({
  head: () => ({ meta: [{ title: "Campaign — Campayn" }] }),
  component: CampaignDetail,
});

function CampaignDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [c, setC] = useState<any>(null);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [avgViews, setAvgViews] = useState(50000);
  const [busy, setBusy] = useState(false);
  const [aiOut, setAiOut] = useState<any>(null);
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => {
    supabase.from("campaigns").select("*").eq("id", id).maybeSingle().then(({ data }) => setC(data));
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: app } = await supabase.from("applications").select("*").eq("user_id", user.id).eq("campaign_id", id).maybeSingle();
      setExistingApp(app);
      const { data: socials } = await supabase.from("social_connections").select("avg_views").eq("user_id", user.id);
      if (socials?.length) {
        const top = Math.max(...socials.map((s: any) => s.avg_views || 0));
        if (top > 0) setAvgViews(top);
      }
    });
  }, [id]);

  if (!c) return <div className="px-5 pt-10 text-muted-foreground">Loading…</div>;
  const est = Math.round((avgViews / 1) * (c.cpv_paise / 100));
  const dod = c.do_dont as { do: string[]; dont: string[] };
  const days = c.deadline ? Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 86400000)) : null;
  const slotsLeft = c.slots_total - c.slots_filled;
  const fillPct = Math.min(100, Math.round((c.slots_filled / Math.max(1, c.slots_total)) * 100));

  async function apply() {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in first");
      const { error } = await supabase.from("applications").insert({
        user_id: user.id, campaign_id: c.id, estimated_earning_inr: est, status: "applied",
      });
      if (error) throw error;
      await supabase.from("notifications").insert({
        user_id: user.id, kind: "system", title: `Applied to ${c.brand_name}`,
        body: `You applied to "${c.title}". You'll hear from the brand soon.`,
      });
      toast.success("Applied! Track it in My Campaigns.");
      nav({ to: "/app/campaigns" });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function genCaption() {
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-helper", {
        body: { kind: "caption", payload: { brand: c.brand_name, title: c.title, brief: c.brief } },
      });
      if (error) throw error;
      setAiOut(data);
    } catch (e: any) { toast.error(e.message ?? "AI error"); }
    finally { setAiBusy(false); }
  }

  return (
    <div className="pb-32">
      <BrandCover brandName={c.brand_name} brandLogoUrl={c.brand_logo_url} coverUrl={c.cover_image_url} height={240}>
        <Link
          to="/app/discover"
          className="absolute top-4 left-4 z-20 h-10 w-10 rounded-full bg-white/90 backdrop-blur grid place-items-center shadow"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Link>
        <button className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-white/90 backdrop-blur grid place-items-center shadow">
          <Share2 className="h-4 w-4 text-foreground" />
        </button>
        <div className="absolute left-5 right-5 bottom-5 z-10 text-white">
          <div className="text-[11px] font-medium uppercase tracking-widest opacity-90">{c.brand_name} · {c.platform}</div>
          <div className="text-[22px] font-bold leading-tight mt-1 line-clamp-2">{c.title}</div>
          {c.tagline && <div className="text-[13px] opacity-90 mt-1 line-clamp-2">{c.tagline}</div>}
        </div>
      </BrandCover>

      <div className="px-5 -mt-8 relative z-10">
        {/* Earning hero */}
        <div className="cmp-card p-5 grad-coin">
          <div className="text-[11px] uppercase tracking-widest font-bold opacity-80">You'll earn</div>
          <div className="mt-1 text-4xl font-black tracking-tight">{inrFmt(est)}</div>
          <div className="mt-1 text-[13px] opacity-80">
            at ₹{(c.cpv_paise/100).toFixed(2)}/view × {compactFmt(avgViews)} avg views
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="cmp-card p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-primary" />
            <div className="text-[10px] uppercase text-muted-foreground mt-1">Deadline</div>
            <div className="font-bold text-sm mt-0.5">{days === null ? "Open" : `${days}d`}</div>
          </div>
          <div className="cmp-card p-3 text-center">
            <Users className="h-4 w-4 mx-auto text-primary" />
            <div className="text-[10px] uppercase text-muted-foreground mt-1">Slots</div>
            <div className="font-bold text-sm mt-0.5">{slotsLeft} left</div>
          </div>
          <div className="cmp-card p-3 text-center">
            <Eye className="h-4 w-4 mx-auto text-primary" />
            <div className="text-[10px] uppercase text-muted-foreground mt-1">CPV</div>
            <div className="font-bold text-sm mt-0.5">₹{(c.cpv_paise/100).toFixed(2)}</div>
          </div>
        </div>

        {/* Slot fill bar */}
        <div className="mt-3 px-1">
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${fillPct}%` }} />
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">{c.slots_filled} of {c.slots_total} creators onboarded</div>
        </div>

        {/* Niches */}
        {c.target_niches?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {c.target_niches.map((n: string) => <span key={n} className="chip capitalize">{n}</span>)}
            {(c.target_tiers as string[])?.map(t => <span key={t} className="chip chip-neutral capitalize">{t}</span>)}
          </div>
        )}

        {/* Brief */}
        <h3 className="mt-6 font-bold text-[15px]">Brief</h3>
        <p className="mt-1.5 text-[14px] text-muted-foreground whitespace-pre-line leading-relaxed">{c.brief}</p>

        {c.deliverables?.length > 0 && (
          <>
            <h3 className="mt-5 font-bold text-[15px]">Deliverables</h3>
            <ul className="mt-2 space-y-1.5">
              {c.deliverables.map((d: string) => (
                <li key={d} className="text-[14px] text-muted-foreground flex gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />{d}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Do / Don't */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="cmp-card p-3.5">
            <div className="text-[11px] uppercase tracking-widest font-bold" style={{ color: "#15803D" }}>Do</div>
            <ul className="mt-2 space-y-1.5">
              {(dod?.do ?? []).map(d => (
                <li key={d} className="text-[12px] flex gap-1.5">
                  <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#22C55E" }} />{d}
                </li>
              ))}
            </ul>
          </div>
          <div className="cmp-card p-3.5">
            <div className="text-[11px] uppercase tracking-widest font-bold" style={{ color: "#B91C1C" }}>Don't</div>
            <ul className="mt-2 space-y-1.5">
              {(dod?.dont ?? []).map(d => (
                <li key={d} className="text-[12px] flex gap-1.5">
                  <X className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />{d}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI helper */}
        <button
          onClick={genCaption}
          disabled={aiBusy}
          className="mt-5 w-full cmp-card p-3.5 flex items-center justify-center gap-2 font-semibold text-sm"
        >
          {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
          Get caption ideas with AI
        </button>
        {aiOut?.captions && (
          <div className="mt-3 space-y-2">
            {aiOut.captions.map((cap: string, i: number) => (
              <div key={i} className="cmp-card p-3 text-[13px] leading-relaxed">{cap}</div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky apply bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto">
          {existingApp ? (
            <Link to="/app/application/$id" params={{ id: existingApp.id }} className="btn-primary w-full" style={{ background: "var(--secondary)", color: "var(--primary)" }}>
              Already applied — view status
            </Link>
          ) : (
            <button disabled={busy || slotsLeft <= 0} onClick={apply} className="btn-primary w-full">
              {busy ? "Applying…" : slotsLeft <= 0 ? "Slots full" : `Apply — earn ${inrFmt(est)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
