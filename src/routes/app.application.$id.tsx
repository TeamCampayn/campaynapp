import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Sparkles, Loader2, Check, FileText, ClipboardCheck, Video, Eye, ShieldCheck,
  Coins, Send, Clock, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { inrFmt } from "@/lib/auth";

export const Route = createFileRoute("/app/application/$id")({
  head: () => ({ meta: [{ title: "Application - Campayn" }]}),
  component: ApplicationDetail,
});

const STAGES: { key: string; label: string; icon: any; statuses: string[] }[] = [
  { key: "applied",    label: "Applied",        icon: Send,          statuses: ["applied"] },
  { key: "approved",   label: "Approved by brand", icon: Check,      statuses: ["approved","script_submitted","script_approved","revision_requested","video_submitted","video_approved","posted","verified","paid","withdrawn"] },
  { key: "script",     label: "Script submitted", icon: FileText,    statuses: ["script_submitted","script_approved","revision_requested","video_submitted","video_approved","posted","verified","paid","withdrawn"] },
  { key: "script_ok",  label: "Script approved",  icon: ClipboardCheck, statuses: ["script_approved","video_submitted","video_approved","posted","verified","paid","withdrawn"] },
  { key: "posted",     label: "Content posted",   icon: Video,       statuses: ["posted","verified","paid","withdrawn"] },
  { key: "tracking",   label: "Views tracking",   icon: Eye,         statuses: ["posted","verified","paid","withdrawn"] },
  { key: "verified",   label: "Verified by Campayn", icon: ShieldCheck, statuses: ["verified","paid","withdrawn"] },
  { key: "paid",       label: "Paid to wallet",   icon: Coins,       statuses: ["paid","withdrawn"] },
];

function stageIndex(status: string) {
  let last = 0;
  STAGES.forEach((s, idx) => { if (s.statuses.includes(status)) last = idx; });
  return last;
}

function useCountdown(target: string | null | undefined) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!target) return null;
  const diff = Math.max(0, new Date(target).getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff === 0 };
}

function ApplicationDetail() {
  const { id } = Route.useParams();
  const [a, setA] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [script, setScript] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

  async function load() {
    const { data } = await supabase.from("applications").select("*, campaigns(*)").eq("id", id).maybeSingle();
    setA(data);
    const { data: s } = await supabase.from("submissions").select("*").eq("application_id", id).order("created_at");
    setSubs(s ?? []);
    const { data: vs } = await supabase.from("view_snapshots").select("*").eq("application_id", id).order("captured_at", { ascending: true });
    setSnapshots(vs ?? []);
  }
  useEffect(() => { load(); }, [id]);

  // Realtime: refresh on application update
  useEffect(() => {
    const ch = supabase
      .channel(`app-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "applications", filter: `id=eq.${id}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions", filter: `application_id=eq.${id}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "view_snapshots", filter: `application_id=eq.${id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  const currentIdx = a ? stageIndex(a.status) : 0;
  const payout = useCountdown(a?.payout_due_at);
  const latestViews = snapshots.length ? snapshots[snapshots.length - 1].views : (a?.verified_views ?? 0);
  const projected = useMemo(() => {
    if (!a) return 0;
    const cpv = (a.campaigns?.cpv_paise ?? 50) / 100;
    return Math.round(latestViews * cpv);
  }, [a, latestViews]);

  if (!a) return <div className="px-5 pt-10 text-muted-foreground">Loading…</div>;

  async function submitScript() {
    if (script.length < 10) return toast.error("Write at least a few lines");
    setBusy(true);
    try {
      const { error: se } = await supabase.from("submissions").insert({ application_id: id, kind: "script", content: script });
      if (se) throw se;
      const { error: ue } = await supabase.from("applications").update({ status: "script_submitted" }).eq("id", id);
      if (ue) throw ue;
      setScript(""); toast.success("Script submitted");
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function submitPost() {
    if (!/^https?:\/\//.test(postUrl)) return toast.error("Paste a valid URL");
    setBusy(true);
    try {
      const { error: se } = await supabase.from("submissions").insert({ application_id: id, kind: "video", asset_url: postUrl });
      if (se) throw se;
      const { error: ue } = await supabase.from("applications").update({ status: "posted", post_url: postUrl }).eq("id", id);
      if (ue) throw ue;
      setPostUrl(""); toast.success("Post submitted - verification in 24h");
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function genScript() {
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-helper", {
        body: { kind: "script", payload: { brand: a.campaigns.brand_name, title: a.campaigns.title, brief: a.campaigns.brief, deliverables: a.campaigns.deliverables } },
      });
      if (error) throw error;
      const text = `HOOK:\n${data.hook}\n\nBODY:\n${data.body}\n\nCTA:\n${data.cta}`;
      setScript(text);
    } catch (e: any) { toast.error(e.message); }
    finally { setAiBusy(false); }
  }

  const showScript = ["approved","revision_requested"].includes(a.status);
  const showPost = ["script_approved","video_approved"].includes(a.status);
  const isRejected = a.status === "rejected";

  return (
    <div className="px-5 pt-6 pb-24">
      <Link to="/app/campaigns" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* Brand header */}
      <div className="cmp-card p-4 flex items-center gap-3">
        {a.campaigns?.brand_logo_url
          ? <img src={a.campaigns.brand_logo_url} className="h-12 w-12 rounded-xl bg-white object-contain p-1 border border-border" />
          : <div className="h-12 w-12 rounded-xl grad-primary grid place-items-center text-white font-black">{a.campaigns?.brand_name?.[0] ?? "B"}</div>}
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{a.campaigns?.brand_name}</div>
          <div className="font-black text-[15px] truncate">{a.campaigns?.title}</div>
        </div>
      </div>

      {/* Earnings hero */}
      <div className="mt-3 cmp-card p-4 grad-coin text-white relative overflow-hidden">
        <div className="text-[11px] uppercase tracking-widest opacity-80 font-bold">
          {a.status === "paid" ? "Paid out" : a.status === "verified" ? "Final earning" : "Estimated earning"}
        </div>
        <div className="mt-1 text-[34px] font-black tracking-tight leading-none">
          {inrFmt(a.final_earning_inr ?? a.estimated_earning_inr ?? projected ?? 0)}
        </div>
        {payout && !payout.done && a.status !== "paid" && a.status !== "withdrawn" && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-[12px] font-bold">
            <Clock className="h-3.5 w-3.5" /> Payout in {payout.d}d {payout.h}h {payout.m}m {payout.s}s
          </div>
        )}
        {a.brand_feedback && (
          <div className="mt-3 text-[12.5px] bg-white/15 backdrop-blur rounded-xl p-3">💬 {a.brand_feedback}</div>
        )}
      </div>

      {isRejected && (
        <div className="mt-3 rounded-2xl p-4 border flex items-start gap-3"
          style={{ background: "rgba(239,67,67,0.06)", borderColor: "rgba(239,67,67,0.18)" }}>
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[14px]">Application not approved</div>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">No worries - keep applying. New campaigns drop daily.</p>
          </div>
        </div>
      )}

      {/* Vertical 8-stage timeline */}
      <h3 className="mt-6 font-bold text-[15px] mb-3">Your journey</h3>
      <ol className="relative pl-2">
        {STAGES.map((s, idx) => {
          const Icon = s.icon;
          const done = idx < currentIdx || (idx === currentIdx && a.status === "paid");
          const active = idx === currentIdx && !done && !isRejected;
          const future = idx > currentIdx;
          return (
            <li key={s.key} className="relative pl-12 pb-5 last:pb-0">
              {idx < STAGES.length - 1 && (
                <span className="absolute left-[18px] top-9 bottom-0 w-[2px]"
                  style={{ background: done ? "var(--primary)" : "rgba(225,231,239,0.9)" }} />
              )}
              <span className={`absolute left-0 top-0 h-9 w-9 rounded-full grid place-items-center transition
                ${done ? "grad-primary text-white" : active ? "bg-white border-2 border-primary text-primary ring-primary" : "bg-secondary text-muted-foreground"}`}>
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                {active && <span className="absolute inset-0 rounded-full animate-ping border-2 border-primary opacity-40" />}
              </span>
              <div className={`text-[13.5px] font-bold ${future ? "text-muted-foreground" : "text-foreground"}`}>{s.label}</div>

              {/* Stage-specific action card */}
              {active && s.key === "applied" && (
                <div className="mt-2 cmp-card p-3.5">
                  <div className="text-[12.5px] text-muted-foreground">
                    Sit tight - {a.campaigns?.brand_name} usually responds within 24-48 hours. We'll ping you the moment they approve.
                  </div>
                </div>
              )}
              {active && s.key === "approved" && (
                <div className="mt-2 cmp-card p-3.5">
                  <div className="font-bold text-[13.5px]">🎉 You're in! Submit your script next.</div>
                  <div className="text-[12px] text-muted-foreground mt-1">
                    Use the AI helper below or write your own. The brand reviews scripts in 24h.
                  </div>
                </div>
              )}
              {active && s.key === "script" && (
                <div className="mt-2 cmp-card p-3.5 text-[12.5px] text-muted-foreground">
                  Brand is reviewing your script. Average turnaround: 18 hours.
                </div>
              )}
              {active && s.key === "script_ok" && (
                <div className="mt-2 cmp-card p-3.5">
                  <div className="font-bold text-[13.5px]">📹 Time to film & post</div>
                  <ul className="mt-2 space-y-1.5 text-[12.5px] text-muted-foreground">
                    <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" /> Use brand mention in caption</li>
                    <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" /> Tag @{a.campaigns?.brand_name?.toLowerCase().replace(/\s+/g, "")}</li>
                    <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" /> Add #ad or #paidpartnership</li>
                    <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" /> Don't delete for at least 30 days</li>
                  </ul>
                </div>
              )}
              {active && (s.key === "posted" || s.key === "tracking") && (
                <div className="mt-2 cmp-card p-3.5">
                  <div className="flex items-baseline gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <div className="text-[12px] uppercase tracking-widest font-bold text-muted-foreground">Live views</div>
                    <div className="ml-auto font-black text-[20px] text-foreground tabular-nums">
                      {Number(latestViews).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="mt-2 text-[11.5px] text-muted-foreground">
                    Projected payout at current pace: <span className="text-primary font-bold">{inrFmt(projected)}</span>
                  </div>
                  {a.post_url && (
                    <a href={a.post_url} target="_blank" rel="noreferrer" className="mt-2 block text-[12px] font-semibold text-primary truncate">
                      ↗ {a.post_url}
                    </a>
                  )}
                </div>
              )}
              {active && s.key === "verified" && (
                <div className="mt-2 cmp-card p-3.5 text-[12.5px] text-muted-foreground">
                  Verified ✅ Payout being released to your wallet.
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Action: Submit script */}
      {showScript && (
        <div className="mt-6 cmp-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[15px]">Submit your script</h3>
            <button onClick={genScript} disabled={aiBusy}
              className="inline-flex items-center gap-1.5 chip-glass">
              {aiBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 sparkle" />}
              {aiBusy ? "Thinking…" : "Generate with AI"}
            </button>
          </div>
          <textarea value={script} onChange={e => setScript(e.target.value)}
            placeholder="HOOK / BODY / CTA"
            className="cmp-textarea mt-3 min-h-[180px]" />
          <button disabled={busy || script.length < 10} onClick={submitScript}
            className="btn-primary w-full mt-3 disabled:opacity-50">
            {busy ? "Submitting…" : "Submit script"}
          </button>
        </div>
      )}

      {/* Action: Submit post URL */}
      {showPost && (
        <div className="mt-5 cmp-card p-4">
          <h3 className="font-bold text-[15px]">Drop your live post link</h3>
          <p className="text-[12.5px] text-muted-foreground mt-1">Paste the public URL of your reel / video. We start tracking views immediately.</p>
          <input value={postUrl} onChange={e => setPostUrl(e.target.value)}
            placeholder="https://instagram.com/reel/..."
            className="cmp-input mt-3" />
          <button disabled={busy || !postUrl} onClick={submitPost}
            className="btn-primary w-full mt-3 disabled:opacity-50">
            {busy ? "Submitting…" : "Submit post"}
          </button>
        </div>
      )}

      {/* Submissions log */}
      {subs.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-[15px] mb-2">Submissions</h3>
          <ul className="space-y-2">
            {subs.map(s => (
              <li key={s.id} className="cmp-card p-3.5 text-sm">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                  {s.kind} · {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  {s.approved === true && <span className="ml-2 text-success">approved</span>}
                  {s.approved === false && <span className="ml-2 text-destructive">revision</span>}
                </div>
                {s.content && <p className="mt-1.5 whitespace-pre-line line-clamp-4 text-[13px]">{s.content}</p>}
                {s.asset_url && <a href={s.asset_url} target="_blank" rel="noreferrer" className="mt-1 block text-primary text-[12.5px] font-semibold truncate">↗ {s.asset_url}</a>}
                {s.feedback && <p className="mt-2 text-[12px] bg-secondary rounded-lg p-2.5">💬 {s.feedback}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}