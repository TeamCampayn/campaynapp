import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { inrFmt } from "@/lib/auth";

export const Route = createFileRoute("/app/application/$id")({
  head: () => ({ meta: [{ title: "Application - Campayn" }]}),
  component: ApplicationDetail,
});

function ApplicationDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
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

  return (
    <div className="px-5 pt-6 pb-24">
      <Link to="/app/campaigns" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
        {a.campaigns?.brand_logo_url && <img src={a.campaigns.brand_logo_url} className="h-12 w-12 rounded-xl bg-white object-contain p-1" />}
        <div>
          <div className="text-xs uppercase text-muted-foreground">{a.campaigns?.brand_name}</div>
          <div className="font-black">{a.campaigns?.title}</div>
        </div>
      </div>

      <div className="mt-4 glass-card rounded-2xl p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Status</div>
        <div className="font-bold mt-1">{a.status}</div>
        <div className="mt-2 text-coin font-black">{inrFmt(a.final_earning_inr ?? a.estimated_earning_inr)}</div>
        {a.brand_feedback && <p className="mt-3 text-sm bg-secondary rounded-xl p-3">💬 {a.brand_feedback}</p>}
      </div>

      {showScript && (
        <div className="mt-5">
          <h3 className="font-bold">Submit your script</h3>
          <button onClick={genScript} disabled={aiBusy} className="mt-2 chip">
            {aiBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-coin" />} Generate with AI
          </button>
          <textarea value={script} onChange={e => setScript(e.target.value)} placeholder="HOOK / BODY / CTA"
            className="mt-2 w-full bg-input/60 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary min-h-[160px]" />
          <button disabled={busy} onClick={submitScript} className="mt-3 w-full grad-coin py-3 rounded-2xl font-bold ring-coin disabled:opacity-50">
            {busy ? "…" : "Submit script"}
          </button>
        </div>
      )}

      {showPost && (
        <div className="mt-5">
          <h3 className="font-bold">Submit your live post URL</h3>
          <input value={postUrl} onChange={e => setPostUrl(e.target.value)} placeholder="https://instagram.com/reel/..."
            className="mt-2 w-full bg-input/60 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
          <button disabled={busy} onClick={submitPost} className="mt-3 w-full grad-coin py-3 rounded-2xl font-bold ring-coin disabled:opacity-50">
            {busy ? "…" : "Submit post"}
          </button>
        </div>
      )}

      {subs.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold">Submissions</h3>
          <ul className="mt-2 space-y-2">
            {subs.map(s => (
              <li key={s.id} className="glass-card rounded-xl p-3 text-sm">
                <div className="text-xs uppercase text-muted-foreground">{s.kind} · {new Date(s.created_at).toLocaleDateString()}</div>
                {s.content && <p className="mt-1 whitespace-pre-line line-clamp-4">{s.content}</p>}
                {s.asset_url && <a href={s.asset_url} target="_blank" rel="noreferrer" className="mt-1 block text-coin underline truncate">{s.asset_url}</a>}
                {s.feedback && <p className="mt-1 text-xs bg-secondary rounded p-2">💬 {s.feedback}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}