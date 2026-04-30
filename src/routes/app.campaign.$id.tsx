import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { inrFmt } from "@/lib/auth";
import { ArrowLeft, Check, X, Sparkles, Clock, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/campaign/$id")({
  head: () => ({ meta: [{ title: "Campaign — Campayn" }]}),
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
  const est = Math.round((avgViews / 1000) * (c.cpv_paise / 100));
  const dod = c.do_dont as { do: string[]; dont: string[] };
  const days = c.deadline ? Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 86400000)) : null;

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
      <div className="relative h-44 bg-cover bg-center" style={{ backgroundImage: c.cover_image_url ? `url(${c.cover_image_url})` : undefined, background: c.cover_image_url ? undefined : "var(--surface-2)" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <Link to="/app/discover" className="absolute top-4 left-4 h-9 w-9 rounded-full bg-background/70 backdrop-blur grid place-items-center"><ArrowLeft className="h-4 w-4" /></Link>
      </div>
      <div className="px-5 -mt-8">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          {c.brand_logo_url && <img src={c.brand_logo_url} className="h-12 w-12 rounded-xl bg-white object-contain p-1" />}
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.brand_name} · {c.platform}</div>
            <div className="font-black text-lg leading-tight">{c.title}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="glass-card rounded-xl p-3">
            <div className="text-[10px] uppercase text-muted-foreground">You earn</div>
            <div className="text-coin font-black mt-0.5">{inrFmt(est)}</div>
          </div>
          <div className="glass-card rounded-xl p-3">
            <div className="text-[10px] uppercase text-muted-foreground">CPV</div>
            <div className="font-black mt-0.5">₹{(c.cpv_paise/100).toFixed(2)}</div>
          </div>
          <div className="glass-card rounded-xl p-3">
            <div className="text-[10px] uppercase text-muted-foreground">Slots</div>
            <div className="font-black mt-0.5">{c.slots_total - c.slots_filled}/{c.slots_total}</div>
          </div>
        </div>

        <div className="mt-4 flex gap-3 text-xs text-muted-foreground">
          {days !== null && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {days} days left</span>}
          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {(c.target_tiers as string[]).join(", ")}</span>
        </div>

        {c.tagline && <p className="mt-4 text-[15px]">{c.tagline}</p>}

        <h3 className="mt-6 font-bold">Brief</h3>
        <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{c.brief}</p>

        {c.deliverables?.length > 0 && (
          <>
            <h3 className="mt-5 font-bold">Deliverables</h3>
            <ul className="mt-1 text-sm text-muted-foreground list-disc pl-5 space-y-1">
              {c.deliverables.map((d: string) => <li key={d}>{d}</li>)}
            </ul>
          </>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="glass-card rounded-2xl p-3">
            <div className="text-xs uppercase tracking-wider text-coin font-bold">Do</div>
            <ul className="mt-2 space-y-1.5">
              {(dod?.do ?? []).map(d => <li key={d} className="text-xs flex gap-1.5"><Check className="h-3 w-3 text-coin shrink-0 mt-0.5" />{d}</li>)}
            </ul>
          </div>
          <div className="glass-card rounded-2xl p-3">
            <div className="text-xs uppercase tracking-wider text-destructive font-bold">Don't</div>
            <ul className="mt-2 space-y-1.5">
              {(dod?.dont ?? []).map(d => <li key={d} className="text-xs flex gap-1.5"><X className="h-3 w-3 text-destructive shrink-0 mt-0.5" />{d}</li>)}
            </ul>
          </div>
        </div>

        <button onClick={genCaption} disabled={aiBusy}
          className="mt-5 w-full glass-card rounded-2xl p-3 flex items-center justify-center gap-2 font-semibold text-sm">
          {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-coin" />}
          Generate caption ideas with AI
        </button>
        {aiOut?.captions && (
          <div className="mt-3 space-y-2">
            {aiOut.captions.map((cap: string, i: number) => (
              <div key={i} className="glass-card rounded-xl p-3 text-sm">{cap}</div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-30 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto">
          {existingApp ? (
            <Link to="/app/campaigns" className="block w-full text-center bg-secondary text-secondary-foreground rounded-2xl py-3.5 font-bold">
              Already applied — view status
            </Link>
          ) : (
            <button disabled={busy} onClick={apply} className="w-full grad-coin py-3.5 rounded-2xl font-black ring-coin disabled:opacity-50">
              {busy ? "Applying…" : `Apply — earn ${inrFmt(est)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}