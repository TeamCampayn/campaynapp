import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/app/edit-profile")({
  head: () => ({ meta: [{ title: "Edit profile — Campayn" }] }),
  component: EditProfile,
});

const NICHES = ["fashion","beauty","tech","gaming","food","travel","fitness","comedy","finance","education","lifestyle","music"];
const LANGS = ["Hindi","English","Hinglish","Tamil","Telugu","Marathi","Bengali","Punjabi","Kannada","Malayalam","Gujarati"];

function EditProfile() {
  const nav = useNavigate();
  const [p, setP] = useState<any>({ display_name: "", bio: "", city: "", phone: "", niches: [], languages: [], gender: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) setP({ ...data, niches: data.niches ?? [], languages: data.languages ?? [] });
    });
  }, []);

  function toggle(field: "niches"|"languages", v: string) {
    setP({ ...p, [field]: p[field].includes(v) ? p[field].filter((x: string) => x !== v) : [...p[field], v] });
  }

  async function save() {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const filled = [p.display_name, p.bio, p.city, p.phone].filter(Boolean).length;
      const completion = Math.min(100, 30 + filled * 10 + (p.niches.length ? 10 : 0) + (p.languages.length ? 10 : 0));
      const { error } = await supabase.from("profiles").update({
        display_name: p.display_name, bio: p.bio, city: p.city, phone: p.phone, gender: p.gender,
        niches: p.niches, languages: p.languages, profile_completion: completion,
      }).eq("id", user!.id);
      if (error) throw error;
      toast.success("Saved");
      nav({ to: "/app/profile" });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="px-5 pt-6 pb-10">
      <Link to="/app/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="mt-3 text-2xl font-black">Edit profile</h1>
      <div className="mt-6 space-y-3">
        <Field label="Display name"><input value={p.display_name ?? ""} onChange={e => setP({ ...p, display_name: e.target.value })} className={cls} maxLength={40} /></Field>
        <Field label="Bio"><textarea value={p.bio ?? ""} onChange={e => setP({ ...p, bio: e.target.value })} maxLength={200} className={`${cls} min-h-[80px]`} /></Field>
        <Field label="City"><input value={p.city ?? ""} onChange={e => setP({ ...p, city: e.target.value })} className={cls} /></Field>
        <Field label="Phone"><input value={p.phone ?? ""} onChange={e => setP({ ...p, phone: e.target.value })} className={cls} /></Field>
        <Field label="Gender">
          <select value={p.gender ?? ""} onChange={e => setP({ ...p, gender: e.target.value })} className={cls}>
            <option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option>
          </select>
        </Field>
        <Field label="Niches">
          <div className="flex flex-wrap gap-2">
            {NICHES.map(n => <button key={n} type="button" onClick={() => toggle("niches", n)} className={`chip capitalize ${p.niches.includes(n) ? "ring-2 ring-coin text-coin" : ""}`}>{n}</button>)}
          </div>
        </Field>
        <Field label="Languages">
          <div className="flex flex-wrap gap-2">
            {LANGS.map(n => <button key={n} type="button" onClick={() => toggle("languages", n)} className={`chip ${p.languages.includes(n) ? "ring-2 ring-coin text-coin" : ""}`}>{n}</button>)}
          </div>
        </Field>
      </div>
      <button disabled={busy} onClick={save} className="mt-6 w-full grad-coin py-3.5 rounded-2xl font-bold ring-coin disabled:opacity-50">
        {busy ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

const cls = "w-full bg-input/60 border border-border rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-primary";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</label><div className="mt-1.5">{children}</div></div>;
}