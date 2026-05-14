import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Sparkles, Loader2, Check, FileText, Video, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { inrFmt } from "@/lib/auth";

export const Route = createFileRoute("/app/application/")({
  head: () => ({ meta: [{ title: "Application — Campayn" }] }),
  component: ApplicationDetail,
});

const STAGES = [
  { key: "applied",          label: "Applied",          match: ["applied"] },
  { key: "approved",         label: "Approved",         match: ["approved","script_submitted","script_approved","revision_requested","video_submitted","video_approved","posted","verified","paid","withdrawn"] },
  { key: "script",           label: "Script",           match: ["script_submitted","script_approved","revision_requested","video_submitted","video_approved","posted","verified","paid","withdrawn"] },
  { key: "posted",           label: "Posted",           match: ["posted","video_approved","verified","paid","withdrawn"] },
  { key: "paid",             label: "Paid",             match: ["paid","withdrawn"] },
];

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  applied:            { label: "Applied — awaiting brand",     cls: "status-applied" },
  approved:           { label: "Approved — submit script",     cls: "status-approved" },
  script_submitted:   { label: "Script in review",             cls: "status-pending" },
  script_approved:    { label: "Script approved — go live",    cls: "status-approved" },
  revision_requested: { label: "Revision requested",           cls: "status-pending" },
  video_submitted:    { label: "Video submitted",              cls: "status-pending" },
  video_approved:     { label: "Video approved",               cls: "status-approved" },
  posted:             { label: "Posted — verifying views",     cls: "status-pending" },
  verified:           { label: "Verified",                     cls: "status-paid" },
  paid:               { label: "Paid to wallet",               cls: "status-paid" },
  withdrawn:          { label: "Withdrawn",                    cls: "status-paid" },
  rejected:           { label: "Rejected",                     cls: "status-rejected" },
};

function ApplicationDetail() {
  const { id } = Route.useParams();
  const [a, setA] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [script, setScript] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

  async function load() {
    const { data } = await supabase.from("applications").select("*, campaigns(*)").eq("id", id).maybeSingle();
    setA(data);
    const { data: s } = await supabase.from("submissions").select("*").eq("application_id", id).order("created_at");
    setSubs(s ?? []);
  }
  useEffect(() => { load(); }, [id]);

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
      setPostUrl(""); toast.success("Post submitted — verification in 24h");
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
  const status = STATUS_MAP[a.status] ?? { label: a.status, cls: "status-applied" };
  const c = a.campaigns;

  // current stage index for timeline
  const reachedIdx = STAGES.reduce((acc, st, i) => st.match.includes(a.status) ? i : acc, 0);

  return (
    <div className="px-5 pt-6 pb-24">
      <Link to="/app/campaigns" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to My Campaigns
      </Link>

      {/* Header card */}
      <div className="cmp-card p-4 flex items-center gap-3">
        {c?.brand_logo_url
          ? <img src={c.brand_logo_url} className="h-12 w-12 rounded-xl bg-white object-contain p-1 border border-border" alt={c.brand_name} />
          : <div className="h-12 w-12 rounded-xl grad-primary grid place-items-center text-white font-bold">{c?.brand_name?.[0] ?? "C"}</div>
        }
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{c?.brand_name}</div>
          <div className="font-bold text-[15px] leading-snug truncate">{c?.title}</div>
        </div>
        <Link to="/app/campaign/$id" params={{ id: c?.id }} className="text-xs text-primary font-semibold">View brief</Link>
      </div>

      {/* Earning + Status */}
      <div className="mt-3 cmp-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Earning</div>
            <div className="mt-0.5 text-2xl font-black text-primary">{inrFmt(a.final_earning_inr ?? a.estimated_earning_inr)}</div>
          </div>
          <span className={`status ${status.cls}`}>{status.label}</span>
        </div>
        {a.verified_views != null && (
          <div className="mt-2 text-[12px] text-muted-foreground">Verified {Number(a.verified_views).toLocaleString("en-IN")} views</div>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-4 cmp-card p-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Progress</div>
        <ol className="mt-3 flex items-center justify-between">
          {STAGES.map((s, i) => {
            const reached = i <= reachedIdx;
            return (
              <li key={s.key} className="flex-1 flex flex-col items-center relative">
                {i > 0 && (
                  <span
                    className="absolute right-1/2 top-3 h-0.5 w-full -z-10"
                    style={{ background: i <= reachedIdx ? "var(--primary)" : "var(--border)" }}
                  />
                )}
                <span
                  className={`h-6 w-6 rounded-full grid place-items-center text-[11px] font-bold ${
                    reached ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {reached ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={`mt-1.5 text-[10px] font-semibold ${reached ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {a.brand_feedback && (
        <div className="mt-4 cmp-card p-3.5 flex gap-2">
          <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Brand feedback</div>
            <p className="mt-1 text-sm">{a.brand_feedback}</p>
          </div>
        </div>
      )}

      {showScript && (
        <div className="mt-5 cmp-card p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-[15px]">Submit your script</h3>
          </div>
          <button onClick={genScript} disabled={aiBusy} className="mt-2 chip">
            {aiBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Generate with AI
          </button>
          <textarea
            value={script}
            onChange={e => setScript(e.target.value)}
            placeholder="HOOK / BODY / CTA"
            className="cmp-textarea mt-3"
          />
          <button disabled={busy} onClick={submitScript} className="btn-primary w-full mt-3">
            {busy ? "…" : "Submit script"}
          </button>
        </div>
      )}

      {showPost && (
        <div className="mt-5 cmp-card p-4">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-[15px]">Submit your live post URL</h3>
          </div>
          <input
            value={postUrl}
            onChange={e => setPostUrl(e.target.value)}
            placeholder="https://instagram.com/reel/..."
            className="cmp-input mt-3"
          />
          <button disabled={busy} onClick={submitPost} className="btn-primary w-full mt-3">
            {busy ? "…" : "Submit post"}
          </button>
        </div>
      )}

      {subs.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-[15px]">Submission history</h3>
          <ul className="mt-2 space-y-2">
            {subs.map(s => (
              <li key={s.id} className="cmp-card p-3.5 text-sm">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  {s.kind} · {new Date(s.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                  {s.approved === true && <span className="ml-2 text-[10px] text-success">approved</span>}
                  {s.approved === false && <span className="ml-2 text-[10px] text-destructive">needs revision</span>}
                </div>
                {s.content && <p className="mt-1.5 whitespace-pre-line line-clamp-4">{s.content}</p>}
                {s.asset_url && <a href={s.asset_url} target="_blank" rel="noreferrer" className="mt-1.5 block text-primary underline truncate">{s.asset_url}</a>}
                {s.feedback && <p className="mt-1.5 text-xs bg-secondary text-secondary-foreground rounded-lg p-2">💬 {s.feedback}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
