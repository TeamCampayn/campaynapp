import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Logo } from "@/components/app/Logo";
import { Check, ChevronRight, Instagram, Youtube } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your profile — Campayn" }]}),
  component: Onboarding,
});

const NICHES = ["fashion","beauty","tech","gaming","food","travel","fitness","comedy","finance","education","lifestyle","music"];
const LANGS = ["Hindi","English","Hinglish","Tamil","Telugu","Marathi","Bengali","Punjabi","Kannada","Malayalam","Gujarati"];
const CITIES = ["Mumbai","Delhi","Bengaluru","Hyderabad","Chennai","Pune","Kolkata","Ahmedabad","Jaipur","Lucknow","Other"];

function Onboarding() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [niches, setNiches] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("onboarding_complete").eq("id", user.id).maybeSingle()
      .then(({ data }) => { if (data?.onboarding_complete) setDone(true); });
  }, [user]);

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" />;
  if (done) return <Navigate to="/app/discover" />;

  function toggle(arr: string[], setArr: (a: string[]) => void, v: string) {
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  }

  async function finish() {
    setBusy(true);
    try {
      const completion = 20 + (niches.length ? 20 : 0) + (languages.length ? 15 : 0) + (city ? 15 : 0) + (bio ? 10 : 0);
      const { error } = await supabase.from("profiles").update({
        niches, languages, city, bio,
        onboarding_complete: true,
        profile_completion: Math.min(80, completion),
      }).eq("id", user!.id);
      if (error) throw error;
      toast.success("Profile saved 🎯");
      nav({ to: "/app/discover" });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function connectStub(platform: "instagram" | "youtube") {
    setBusy(true);
    try {
      const followers = Math.floor(2000 + Math.random() * 80000);
      const avg_views = Math.floor(followers * (0.15 + Math.random() * 0.4));
      const tier = avg_views < 10000 ? "nano" : avg_views < 50000 ? "micro" : avg_views < 200000 ? "mid" : "macro";
      const { error } = await supabase.from("social_connections").insert({
        user_id: user!.id, platform, handle: `@${platform}_creator`,
        followers, avg_views, engagement_rate: 3.5, tier, is_stub: true,
      });
      if (error) throw error;
      toast.success(`${platform === "instagram" ? "Instagram" : "YouTube"} connected (stub)`);
      setStep(step + 1);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  const steps = [
    {
      title: "What do you create?",
      sub: "Pick all that apply. Brands match by niche.",
      body: (
        <div className="flex flex-wrap gap-2">
          {NICHES.map(n => (
            <button key={n} onClick={() => toggle(niches, setNiches, n)}
              className={`chip capitalize ${niches.includes(n) ? "ring-2 ring-coin text-coin" : ""}`}>{n}</button>
          ))}
        </div>
      ),
      canNext: niches.length >= 1,
    },
    {
      title: "Which languages?",
      sub: "Helps us match regional brands.",
      body: (
        <div className="flex flex-wrap gap-2">
          {LANGS.map(n => (
            <button key={n} onClick={() => toggle(languages, setLanguages, n)}
              className={`chip ${languages.includes(n) ? "ring-2 ring-coin text-coin" : ""}`}>{n}</button>
          ))}
        </div>
      ),
      canNext: languages.length >= 1,
    },
    {
      title: "Where are you based?",
      sub: "Some campaigns are city-specific.",
      body: (
        <div className="flex flex-wrap gap-2">
          {CITIES.map(n => (
            <button key={n} onClick={() => setCity(n)}
              className={`chip ${city === n ? "ring-2 ring-coin text-coin" : ""}`}>{n}</button>
          ))}
        </div>
      ),
      canNext: !!city,
    },
    {
      title: "Connect your accounts",
      sub: "We'll show personalised earnings. (OAuth stubbed for now — generates demo numbers.)",
      body: (
        <div className="space-y-3">
          <button disabled={busy} onClick={() => connectStub("instagram")}
            className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99]">
            <div className="h-10 w-10 rounded-xl grad-primary grid place-items-center"><Instagram className="h-5 w-5 text-primary-foreground" /></div>
            <div className="flex-1 text-left"><div className="font-bold">Instagram</div><div className="text-xs text-muted-foreground">Reels & posts</div></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button disabled={busy} onClick={() => connectStub("youtube")}
            className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99]">
            <div className="h-10 w-10 rounded-xl grad-primary grid place-items-center"><Youtube className="h-5 w-5 text-primary-foreground" /></div>
            <div className="flex-1 text-left"><div className="font-bold">YouTube</div><div className="text-xs text-muted-foreground">Shorts & long-form</div></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => setStep(step + 1)} className="text-sm text-muted-foreground w-full text-center pt-2">Skip for now</button>
        </div>
      ),
      canNext: true,
    },
    {
      title: "Add a short bio",
      sub: "Optional but boosts brand interest.",
      body: (
        <textarea value={bio} maxLength={200} onChange={e => setBio(e.target.value)} placeholder="e.g. Mumbai-based food creator. 70k+ on Instagram, love biryanis."
          className="w-full bg-input/60 border border-border rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-primary min-h-[120px]" />
      ),
      canNext: true,
    },
  ];

  const cur = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen flex flex-col px-5 pt-6 pb-10 max-w-md mx-auto w-full">
      <Logo />
      <div className="mt-6 flex gap-1.5">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-coin" : "bg-secondary"}`} />
        ))}
      </div>
      <h1 className="mt-8 text-2xl font-black tracking-tight">{cur.title}</h1>
      <p className="mt-2 text-muted-foreground text-sm">{cur.sub}</p>
      <div className="mt-6 flex-1">{cur.body}</div>
      <div className="mt-6 flex gap-3">
        {step > 0 && <button onClick={() => setStep(step - 1)} className="bg-secondary text-secondary-foreground rounded-2xl px-5 py-3 font-semibold">Back</button>}
        <button disabled={busy || !cur.canNext}
          onClick={() => isLast ? finish() : setStep(step + 1)}
          className="flex-1 grad-coin rounded-2xl py-3 font-bold ring-coin disabled:opacity-50">
          {busy ? "…" : isLast ? "Finish" : "Continue"}
          {isLast && <Check className="inline h-4 w-4 ml-1" />}
        </button>
      </div>
    </div>
  );
}