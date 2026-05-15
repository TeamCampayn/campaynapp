import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Bookmark, BadgeCheck, Users, ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/campaign/")({
  head: () => ({ meta: [{ title: "Campaign — Campayn" }] }),
  component: CampaignDetail,
});

const compact = (n: number) => {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
};

type Tab = "brief" | "requirements" | "brand" | "timeline";

function CampaignDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [c, setC] = useState<any>(null);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [appliedCount, setAppliedCount] = useState<number>(0);
  const [avgViews, setAvgViews] = useState(50000);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("brief");
  const [aiOut, setAiOut] = useState<any>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    supabase.from("campaigns").select("*").eq("id", id).maybeSingle().then(({ data }) => setC(data));
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("campaign_id", id)
      .then(({ count }) => setAppliedCount(count ?? 0));
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

  const earning = Math.round((avgViews / 1) * (c.cpv_paise / 100));
  const lo = Math.round(earning * 0.7);
  const hi = Math.round(earning * 1.4);
  const dod = (c.do_dont as { do?: string[]; dont?: string[] }) ?? {};
  const hashtags: string[] = c.hashtags ?? [];
  const keyMessages: string[] = c.key_messages ?? [];

  async function apply() {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in first");
      const { error } = await supabase.from("applications").insert({
        user_id: user.id, campaign_id: c.id, estimated_earning_inr: earning, status: "applied",
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
    <div className="pb-32 bg-background min-h-screen">
      {/* Hero */}
      <div
        className="relative h-[260px] bg-cover bg-center"
        style={{
          backgroundImage: c.cover_image_url ? `url(${c.cover_image_url})` : undefined,
          background: c.cover_image_url ? undefined : "linear-gradient(135deg,#7586F5 0%,#3C4CE2 100%)",
        }}
      >
        <Link
          to="/app/discover"
          className="absolute top-4 left-4 h-10 w-10 rounded-full grid place-items-center text-white"
          style={{ background: "rgba(17,19,55,0.55)", backdropFilter: "blur(6px)" }}
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </Link>
        <button
          onClick={() => setBookmarked(b => !b)}
          className="absolute top-4 right-4 h-10 w-10 rounded-full grid place-items-center text-white"
          style={{ background: "rgba(17,19,55,0.55)", backdropFilter: "blur(6px)" }}
        >
          <Bookmark className="h-[18px] w-[18px]" fill={bookmarked ? "#fff" : "none"} />
        </button>
      </div>
      {/* Brand pill — overlaps hero bottom */}
      <div className="px-5 -mt-5 relative z-10">
        <div className="inline-flex items-center gap-2 bg-white rounded-full pl-1 pr-3.5 py-1 shadow-md border border-border">
          <span className="h-7 w-7 rounded-full grad-primary grid place-items-center text-white text-[12px] font-bold overflow-hidden">
            {c.brand_logo_url ? <img src={c.brand_logo_url} alt="" className="h-7 w-7 object-cover" /> : c.brand_name[0]?.toUpperCase()}
          </span>
          <span className="text-[14px] font-bold text-foreground">{c.brand_name}</span>
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: "var(--primary)" }}>
            <BadgeCheck className="h-4 w-4" fill="currentColor" stroke="#fff" /> Verified
          </span>
        </div>
      </div>
      {/* Title */}
      <div className="px-5 mt-4">
        <h1 className="text-[24px] font-extrabold leading-[1.2] text-foreground tracking-tight">
          {c.title}
        </h1>
      </div>
      {/* Earnings card */}
      <div className="px-5 mt-4">
        <div
          className="rounded-2xl border p-4"
          style={{ background: "var(--secondary)", borderColor: "rgba(60,76,226,0.18)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold" style={{ color: "var(--primary)" }}>
              You'll earn approximately
            </span>
            <ChevronDown className="h-4 w-4" style={{ color: "var(--primary)" }} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[28px]" aria-hidden>🌑</span>
            <span className="text-[30px] font-extrabold text-foreground tracking-tight">
              ₹{compact(earning)}
            </span>
          </div>
          <div className="mt-1 text-[13px] text-muted-foreground">
            Range: ₹{compact(lo)} – ₹{compact(hi)}
          </div>
        </div>
      </div>
      {/* Applied count */}
      <div className="px-5 mt-4 flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{appliedCount} creators have applied</span>
      </div>
      {/* Tabs */}
      <div className="px-5 mt-5">
        <div className="bg-white rounded-2xl border border-border p-1 flex">
          {(["brief", "requirements", "brand", "timeline"] as Tab[]).map(t => {
            const sel = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-xl text-[13px] font-semibold capitalize transition ${
                  sel ? "text-primary" : "text-muted-foreground"
                }`}
                style={sel ? { background: "var(--secondary)" } : undefined}
              >
                {t === "brief" ? "Brief" : t === "requirements" ? "Requirements" : t === "brand" ? "Brand" : "Timeline"}
              </button>
            );
          })}
        </div>
      </div>
      {/* Tab content */}
      <div className="px-5 mt-5 space-y-5">
        {tab === "brief" && (
          <>
            {c.brief && (
              <p className="text-[14.5px] leading-[1.6] text-foreground whitespace-pre-line">
                {c.brief}
              </p>
            )}

            {keyMessages.length > 0 && (
              <div>
                <h3 className="font-bold text-[15px] text-foreground">Key Messages</h3>
                <ul className="mt-2.5 space-y-2">
                  {keyMessages.map((k, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] text-foreground">
                      <span style={{ color: "var(--primary)" }}>→</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-2xl p-3.5 border"
                style={{ background: "rgba(33,196,93,0.08)", borderColor: "rgba(33,196,93,0.25)" }}
              >
                <div className="flex items-center gap-1.5 font-bold text-[14px]" style={{ color: "#15803D" }}>
                  <span>✅</span> Do's
                </div>
                <ul className="mt-2 space-y-1.5 text-[12.5px]" style={{ color: "#15803D" }}>
                  {(dod.do ?? []).map((d, i) => (
                    <li key={i} className="flex gap-1.5"><span>•</span><span>{d}</span></li>
                  ))}
                </ul>
              </div>
              <div
                className="rounded-2xl p-3.5 border"
                style={{ background: "rgba(239,67,67,0.07)", borderColor: "rgba(239,67,67,0.22)" }}
              >
                <div className="flex items-center gap-1.5 font-bold text-[14px]" style={{ color: "#B91C1C" }}>
                  <span>❌</span> Don'ts
                </div>
                <ul className="mt-2 space-y-1.5 text-[12.5px]" style={{ color: "#B91C1C" }}>
                  {(dod.dont ?? []).map((d, i) => (
                    <li key={i} className="flex gap-1.5"><span>•</span><span>{d}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            {hashtags.length > 0 && (
              <div>
                <h3 className="font-bold text-[15px] text-foreground">Required Hashtags</h3>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {hashtags.map((h, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-[12.5px] font-semibold"
                      style={{ background: "var(--secondary)", color: "var(--primary)" }}
                    >
                      #{h.replace(/^#/, "")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={genCaption}
              disabled={aiBusy}
              className="w-full bg-white border border-border rounded-2xl p-3 flex items-center justify-center gap-2 font-semibold text-[14px] text-foreground"
            >
              {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" style={{ color: "var(--primary)" }} />}
              Generate caption ideas with AI
            </button>
            {aiOut?.captions && (
              <div className="space-y-2">
                {aiOut.captions.map((cap: string, i: number) => (
                  <div key={i} className="bg-white border border-border rounded-xl p-3 text-sm">{cap}</div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "requirements" && (
          <div className="space-y-3">
            <div className="bg-white border border-border rounded-2xl p-4">
              <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Platform</div>
              <div className="mt-1 font-bold capitalize">{c.platform}</div>
            </div>
            <div className="bg-white border border-border rounded-2xl p-4">
              <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Tiers</div>
              <div className="mt-1 font-bold">{(c.target_tiers as string[])?.join(", ")}</div>
            </div>
            {c.deliverables?.length > 0 && (
              <div className="bg-white border border-border rounded-2xl p-4">
                <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Deliverables</div>
                <ul className="mt-2 space-y-1.5 text-[14px] text-foreground list-disc pl-5">
                  {c.deliverables.map((d: string, i: number) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === "brand" && (
          <div className="bg-white border border-border rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 rounded-xl grad-primary grid place-items-center text-white font-bold overflow-hidden">
                {c.brand_logo_url ? <img src={c.brand_logo_url} alt="" className="h-12 w-12 object-cover" /> : c.brand_name[0]?.toUpperCase()}
              </span>
              <div>
                <div className="font-bold text-[15px]">{c.brand_name}</div>
                <div className="text-[12px] text-muted-foreground inline-flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} fill="currentColor" stroke="#fff" />
                  Verified brand
                </div>
              </div>
            </div>
            {c.tagline && <p className="mt-3 text-[14px] text-muted-foreground">{c.tagline}</p>}
          </div>
        )}

        {tab === "timeline" && (
          <div className="bg-white border border-border rounded-2xl p-4 space-y-3">
            {c.deadline && (
              <div className="flex justify-between text-[14px]">
                <span className="text-muted-foreground">Deadline</span>
                <span className="font-bold">{new Date(c.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            )}
            <div className="flex justify-between text-[14px]">
              <span className="text-muted-foreground">Slots</span>
              <span className="font-bold">{c.slots_total - c.slots_filled} / {c.slots_total} open</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-muted-foreground">CPV</span>
              <span className="font-bold">₹{(c.cpv_paise / 100).toFixed(2)} / view</span>
            </div>
          </div>
        )}
      </div>
      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-30 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto">
          {existingApp ? (
            <Link
              to="/app/campaigns"
              className="block w-full text-center bg-secondary text-secondary-foreground rounded-2xl py-3.5 font-bold"
            >
              Already applied — view status
            </Link>
          ) : (
            <button
              disabled={busy}
              onClick={apply}
              className="w-full grad-coin py-4 rounded-2xl font-bold text-[15px] ring-coin disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {busy ? "Applying…" : <>Apply Now — Earn ₹{compact(earning)} <span aria-hidden>🌑</span></>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
