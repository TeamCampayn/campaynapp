import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Bookmark, BadgeCheck, ChevronDown, ChevronUp, Users, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { RupeeCoin, compactInr } from "@/components/app/RupeeCoin";
import { BrandLogo } from "@/components/app/BrandLogo";

export const Route = createFileRoute("/app/campaign/$id")({
  head: () => ({ meta: [{ title: "Campaign - Campayn" }] }),
  component: CampaignDetail,
});

const compact = (n: number) => n >= 1000 ? (n/1000).toFixed(1).replace(/\.0$/,"") + "K" : String(n);

const TABS = ["Brief","Requirements","Brand","Timeline"] as const;
type Tab = typeof TABS[number];

function CampaignDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [c, setC] = useState<any>(null);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [appliedCount, setAppliedCount] = useState<number>(0);
  const [avgViews, setAvgViews] = useState(50000);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("Brief");
  const [estOpen, setEstOpen] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [aiOut, setAiOut] = useState<any>(null);
  const [aiBusy, setAiBusy] = useState<string | null>(null);

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

  if (!c) return <div className="px-5 pt-10 text-muted-foreground">Loading...</div>;

  const est = Math.round(avgViews * (c.cpv_paise / 100));
  const lo = Math.round(est * 0.7);
  const hi = Math.round(est * 1.4);
  const dod = (c.do_dont as { do?: string[]; dont?: string[] }) ?? {};
  const keyMessages: string[] = (c.deliverables ?? []).slice(0, 3);
  const hashtags: string[] = (c.target_niches ?? []).slice(0, 3).map((n: string) => `#${c.brand_name.replace(/\s+/g,"")}${n.charAt(0).toUpperCase()+n.slice(1)}`);

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
        user_id: user.id, kind: "system",
        title: `Applied to ${c.brand_name}`,
        body: `You applied to "${c.title}". You'll hear from the brand soon.`,
      });
      toast.success("Applied! Track it in My Campaigns.");
      nav({ to: "/app/campaigns" });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function genIdeas(kind: "content_ideas" | "script_ideas" | "caption_ideas") {
    setAiBusy(kind);
    try {
      const { data, error } = await supabase.functions.invoke("ai-helper", {
        body: { kind, payload: { brand: c.brand_name, title: c.title, brief: c.brief, deliverables: c.deliverables } },
      });
      if (error) throw error;
      setAiOut({ kind, data });
    } catch (e: any) { toast.error(e.message ?? "AI error"); }
    finally { setAiBusy(null); }
  }

  return (
    <div className="pb-32">
      {/* HERO */}
      <div className="relative h-[260px] overflow-hidden">
        {c.cover_image_url ? (
          <img src={c.cover_image_url} alt={c.brand_name} referrerPolicy="no-referrer"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 grad-primary -z-10" />
        <button onClick={() => nav({ to: "/app/discover" })}
          className="absolute top-4 left-4 h-10 w-10 rounded-full bg-black/45 backdrop-blur grid place-items-center text-white">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <button onClick={() => setBookmarked(b => !b)}
          className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/45 backdrop-blur grid place-items-center text-white">
          <Bookmark className="h-4.5 w-4.5" fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="px-5 -mt-7 relative">
        {/* Brand verified pill */}
        <div className="inline-flex items-center gap-2 bg-white rounded-full pl-1 pr-3.5 py-1 shadow-md">
          <BrandLogo name={c.brand_name} url={c.brand_logo_url} size={28} />
          <span className="text-[13.5px] font-bold text-foreground">{c.brand_name}</span>
          <span className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-primary">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-4 text-[24px] leading-[1.2] font-black tracking-tight text-foreground">
          {c.title}
        </h1>

        {/* Earnings card (lavender) */}
        <div className="mt-4 rounded-2xl border p-4"
          style={{ background: "linear-gradient(180deg,#F4F1FE 0%,#ECEEFE 100%)", borderColor: "#DDDEF8" }}>
          <button onClick={() => setEstOpen(o => !o)}
            className="w-full flex items-center justify-between text-left">
            <span className="text-[13.5px] font-semibold text-[#3A3F70]">You'll earn approximately</span>
            {estOpen ? <ChevronUp className="h-4 w-4 text-[#3A3F70]" /> : <ChevronDown className="h-4 w-4 text-[#3A3F70]" />}
          </button>
          <div className="mt-2 flex items-center gap-3">
            <RupeeCoin size={28} />
            <div className="text-[34px] leading-none font-black tracking-tight text-foreground">{compactInr(est)}</div>
          </div>
          {estOpen && (
            <div className="mt-2 text-[13px] text-[#5B5F80]">Range: {compactInr(lo)} – {compactInr(hi)}</div>
          )}
        </div>

        {/* Applied count */}
        <div className="mt-4 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span><span className="font-semibold text-foreground">{appliedCount}</span> creators have applied</span>
        </div>

        {/* TABS */}
        <div className="mt-4 cmp-card p-1.5 flex gap-1">
          {TABS.map(t => {
            const active = tab === t;
            return (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition ${
                  active ? "bg-secondary text-primary" : "text-muted-foreground"
                }`}>
                {t}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        {tab === "Brief" && (
          <div className="mt-4 space-y-5">
            <p className="text-[14.5px] leading-relaxed text-foreground/85 whitespace-pre-line">{c.brief}</p>

            {keyMessages.length > 0 && (
              <div>
                <h3 className="font-bold text-[15px] text-foreground">Key Messages</h3>
                <ul className="mt-2.5 space-y-2.5">
                  {keyMessages.map((k, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-[14px] text-foreground">{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3.5" style={{ background:"#E9F8EE", border:"1px solid #C9EBD3" }}>
                <div className="font-bold text-[14px] text-[#15803D] flex items-center gap-1.5">
                  <span>✅</span> Do's
                </div>
                <ul className="mt-2 space-y-1.5">
                  {(dod.do ?? []).map((d, i) => (
                    <li key={i} className="text-[12.5px] text-[#1F5132] leading-snug">• {d}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl p-3.5" style={{ background:"#FDECEC", border:"1px solid #F6CFCF" }}>
                <div className="font-bold text-[14px] text-[#B91C1C] flex items-center gap-1.5">
                  <span>❌</span> Don'ts
                </div>
                <ul className="mt-2 space-y-1.5">
                  {(dod.dont ?? []).map((d, i) => (
                    <li key={i} className="text-[12.5px] text-[#7B1818] leading-snug">• {d}</li>
                  ))}
                </ul>
              </div>
            </div>

            {hashtags.length > 0 && (
              <div>
                <h3 className="font-bold text-[15px] text-foreground">Required Hashtags</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hashtags.map(h => (
                    <span key={h} className="px-3 py-1.5 rounded-full text-[12.5px] font-semibold"
                      style={{ background:"var(--secondary)", color:"var(--primary)" }}>{h}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-bold text-[15px] text-foreground mb-2.5">AI Creator Suite</h3>
              <div className="grid grid-cols-3 gap-2">
                <AiBtn busy={aiBusy === "content_ideas"} onClick={() => genIdeas("content_ideas")} label="Content ideas" />
                <AiBtn busy={aiBusy === "script_ideas"} onClick={() => genIdeas("script_ideas")} label="Script ideas" />
                <AiBtn busy={aiBusy === "caption_ideas"} onClick={() => genIdeas("caption_ideas")} label="Captions" />
              </div>
              {aiOut && <AiResults out={aiOut} />}
            </div>
          </div>
        )}

        {tab === "Requirements" && (
          <div className="mt-4 space-y-4">
            <Row label="Platform" value={c.platform === "youtube" ? "YouTube" : "Instagram"} />
            <Row label="Tiers" value={(c.target_tiers ?? []).join(", ") || "Any"} />
            <Row label="Niches" value={(c.target_niches ?? []).map((n:string)=>n.charAt(0).toUpperCase()+n.slice(1)).join(", ")} />
            <Row label="Slots" value={`${c.slots_total - c.slots_filled} of ${c.slots_total} open`} />
            <Row label="CPV (paid per view)" value={`₹${(c.cpv_paise/100).toFixed(2)}`} />
            {c.deliverables?.length > 0 && (
              <div>
                <div className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Deliverables</div>
                <ul className="mt-2 space-y-1.5">
                  {c.deliverables.map((d:string, i:number) => (
                    <li key={i} className="text-[14px] text-foreground/85">• {d}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === "Brand" && (
          <div className="mt-4 space-y-3">
            <div className="cmp-card p-4 flex items-center gap-3">
              <span className="h-12 w-12 rounded-xl grad-primary grid place-items-center text-white font-black">
                {c.brand_logo_url
                  ? <img src={c.brand_logo_url} alt="" referrerPolicy="no-referrer" className="h-12 w-12 rounded-xl object-cover" />
                  : c.brand_name[0]}
              </span>
              <div>
                <div className="font-bold text-[15px] flex items-center gap-1.5">{c.brand_name}
                  <BadgeCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="text-[12px] text-muted-foreground">Verified brand on Campayn</div>
              </div>
            </div>
            {c.tagline && <p className="text-[14px] text-foreground/85">{c.tagline}</p>}
          </div>
        )}

        {tab === "Timeline" && (
          <div className="mt-4 space-y-3">
            <TLRow n="1" label="Apply" desc="Submit your application." />
            <TLRow n="2" label="Brand approval" desc="Brand reviews and shortlists." />
            <TLRow n="3" label="Submit script" desc="Share your reel script for approval." />
            <TLRow n="4" label="Shoot & post" desc="Post on the deadline date." />
            <TLRow n="5" label="Verify & get paid" desc="Views verified, coins credited." />
            {c.deadline && (
              <div className="text-[12px] text-muted-foreground mt-2">
                Deadline: {new Date(c.deadline).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* STICKY APPLY */}
      <div className="fixed bottom-16 inset-x-0 z-30 px-5 pt-3 pb-3"
        style={{ background:"linear-gradient(180deg, rgba(250,248,245,0) 0%, rgba(250,248,245,0.95) 30%, var(--background) 100%)" }}>
        <div className="max-w-md mx-auto">
          {existingApp ? (
            <Link to="/app/campaigns" className="block w-full text-center bg-secondary text-primary rounded-2xl py-4 font-bold">
              Already applied - view status
            </Link>
          ) : (
            <button disabled={busy} onClick={apply}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-[15px] disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-[0_8px_24px_-8px_rgba(60,76,226,0.55)]">
              {busy ? "Applying..." : <>Apply Now · Earn {compactInr(est)} <RupeeCoin size={20} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      <span className="text-[14px] font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}
function TLRow({ n, label, desc }: { n: string; label: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <span className="h-8 w-8 rounded-full bg-secondary text-primary grid place-items-center text-[13px] font-bold shrink-0">{n}</span>
      <div>
        <div className="font-bold text-[14px]">{label}</div>
        <div className="text-[12.5px] text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
