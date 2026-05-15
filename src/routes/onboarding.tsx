import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Logo } from "@/components/app/Logo";
import { Check, ChevronRight, Instagram, Youtube, Search, MapPin, Lock } from "lucide-react";
import { INDIAN_CITIES } from "@/lib/india";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your profile — Campayn" }]}),
  component: Onboarding,
});

const NICHES = [
  "Fashion","Beauty & Skincare","Tech & Gadgets","Gaming","Food & Cooking","Travel",
  "Fitness","Comedy","Finance","Education","Lifestyle","Music","Healthcare & Wellness",
  "Parenting","Automotive","Photography","Art & Design","Business & Startups",
  "Books & Literature","Sports","Pets & Animals","Spirituality","Home & Decor","Dance",
];
const LANGS = ["Hindi","English","Hinglish","Tamil","Telugu","Marathi","Bengali","Punjabi","Kannada","Malayalam","Gujarati","Urdu","Odia","Assamese"];

const MIN_NICHES = 1;
const MAX_NICHES = 5;

function Onboarding() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [niches, setNiches] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [cityQ, setCityQ] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("onboarding_complete").eq("id", user.id).maybeSingle()
      .then(({ data }) => { if (data?.onboarding_complete) setDone(true); });
  }, [user]);

  const cityMatches = useMemo(() => {
    const q = cityQ.trim().toLowerCase();
    if (!q) return [] as string[];
    return INDIAN_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 8);
  }, [cityQ]);

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" />;
  if (done) return <Navigate to="/app/discover" />;

  function toggle(arr: string[], setArr: (a: string[]) => void, v: string, max?: number) {
    if (arr.includes(v)) setArr(arr.filter(x => x !== v));
    else { if (max && arr.length >= max) return; setArr([...arr, v]); }
  }

  async function finish(skipSocial = false) {
    setBusy(true);
    try {
      const completion = 20 + (niches.length ? 20 : 0) + (languages.length ? 15 : 0) + (city ? 15 : 0) + (bio ? 10 : 0);
      const { error } = await supabase.from("profiles").update({
        niches, languages, city, bio,
        onboarding_complete: true,
        profile_completion: Math.min(80, completion),
      }).eq("id", user!.id);
      if (error) throw error;
      toast.success(skipSocial ? "Profile saved — you can connect Instagram later" : "Profile saved 🎯");
      nav({ to: "/app/discover" });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  function connectInstagramSoon() {
    toast.info("Instagram OAuth ships next week — we'll email you the moment it's live.");
  }
  function connectYouTubeSoon() {
    toast.info("YouTube OAuth ships next week.");
  }

  const steps = [
    {
      title: "What do you create & in which language?",
      sub: `Pick ${MIN_NICHES}–${MAX_NICHES} niches and the languages you use. Brands match by both.`,
      body: (
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[13px] font-semibold text-foreground">Your niches</h3>
              <span className="text-[11px] text-muted-foreground">{niches.length}/{MAX_NICHES} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {NICHES.map(n => {
                const sel = niches.includes(n);
                const disabled = !sel && niches.length >= MAX_NICHES;
                return (
                  <button key={n} disabled={disabled}
                    onClick={() => toggle(niches, setNiches, n, MAX_NICHES)}
                    className={`px-3.5 py-2 rounded-full text-[13px] font-medium border transition ${
                      sel ? "bg-primary text-white border-primary"
                          : disabled ? "bg-white text-muted-foreground border-border opacity-50"
                                     : "bg-white text-foreground border-border hover:border-primary/40"
                    }`}>{n}</button>
                );
              })}
            </div>
          </section>
          <section>
            <h3 className="text-[13px] font-semibold text-foreground mb-2.5">Languages you create in</h3>
            <div className="flex flex-wrap gap-2">
              {LANGS.map(n => {
                const sel = languages.includes(n);
                return (
                  <button key={n} onClick={() => toggle(languages, setLanguages, n)}
                    className={`px-3.5 py-2 rounded-full text-[13px] font-medium border transition ${
                      sel ? "bg-primary text-white border-primary"
                          : "bg-white text-foreground border-border hover:border-primary/40"
                    }`}>{n}</button>
                );
              })}
            </div>
          </section>
        </div>
      ),
      canNext: niches.length >= MIN_NICHES && languages.length >= 1,
    },
    {
      title: "Where are you based & a quick intro",
      sub: "City helps us match local brand campaigns. Bio is optional — boosts brand interest.",
      body: (
        <div className="space-y-5">
          <section>
            <label className="text-[13px] font-semibold text-foreground">City or town</label>
            <div className="relative mt-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={city || cityQ}
                onChange={e => { setCity(""); setCityQ(e.target.value); }}
                placeholder="Start typing — e.g. 'Gha' for Ghaziabad"
                className="cmp-input pl-10" />
              {city && (
                <button onClick={() => { setCity(""); setCityQ(""); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Change</button>
              )}
            </div>
            {!city && cityMatches.length > 0 && (
              <ul className="mt-2 cmp-card divide-y divide-border max-h-60 overflow-auto">
                {cityMatches.map(c => (
                  <li key={c}>
                    <button onClick={() => { setCity(c); setCityQ(""); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" /> {c}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {!city && !cityQ && (
              <p className="text-[11px] text-muted-foreground mt-2">Covers all major Indian cities and most tier-2/3 towns.</p>
            )}
          </section>
          <section>
            <label className="text-[13px] font-semibold text-foreground">Short bio <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea value={bio} maxLength={200} onChange={e => setBio(e.target.value)}
              placeholder="e.g. Mumbai-based food creator. Reels on biryani, street food and home recipes."
              className="cmp-textarea mt-2" />
            <div className="text-[11px] text-muted-foreground mt-1 text-right">{bio.length}/200</div>
          </section>
        </div>
      ),
      canNext: !!city,
    },
    {
      title: "Connect your accounts",
      sub: "Brands pay based on your real reach. Connect at least one — or skip and add later.",
      body: (
        <div className="space-y-3">
          <button onClick={connectInstagramSoon}
            className="w-full cmp-card p-4 flex items-center gap-3 active:scale-[0.99] transition">
            <div className="h-11 w-11 rounded-xl grad-primary grid place-items-center"><Instagram className="h-5 w-5 text-white" /></div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-foreground flex items-center gap-2">Connect Instagram <Lock className="h-3 w-3 text-muted-foreground" /></div>
              <div className="text-xs text-muted-foreground">Reels, posts & insights — official OAuth</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={connectYouTubeSoon}
            className="w-full cmp-card p-4 flex items-center gap-3 active:scale-[0.99] transition">
            <div className="h-11 w-11 rounded-xl grad-primary grid place-items-center"><Youtube className="h-5 w-5 text-white" /></div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-foreground flex items-center gap-2">Connect YouTube <Lock className="h-3 w-3 text-muted-foreground" /></div>
              <div className="text-xs text-muted-foreground">Shorts & long-form — Google OAuth</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="cmp-card p-3.5 bg-secondary/60 text-[12px] text-muted-foreground flex gap-2">
            <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
            <span>Official Instagram & YouTube OAuth is rolling out this month. Skip for now and you can connect anytime from your profile.</span>
          </div>
        </div>
      ),
      canNext: true,
    },
  ];

  const cur = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen flex flex-col px-5 pt-6 pb-10 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between">
        <Logo />
        <span className="text-[11px] font-semibold text-muted-foreground tracking-wider">STEP {step + 1} / {steps.length}</span>
      </div>
      <div className="mt-5 flex gap-1.5">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-primary" : "bg-secondary"}`} />
        ))}
      </div>
      <h1 className="mt-7 text-[26px] font-extrabold tracking-tight text-foreground leading-tight">{cur.title}</h1>
      <p className="mt-2 text-muted-foreground text-[14px]">{cur.sub}</p>
      <div className="mt-6 flex-1">{cur.body}</div>
      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn-ghost">Back</button>
        )}
        {isLast ? (
          <>
            <button disabled={busy} onClick={() => finish(true)} className="btn-ghost">Skip</button>
            <button disabled={busy} onClick={() => finish(false)} className="btn-primary flex-1 h-12">
              {busy ? "Saving…" : <>Finish <Check className="h-4 w-4" /></>}
            </button>
          </>
        ) : (
          <button disabled={busy || !cur.canNext} onClick={() => setStep(step + 1)} className="btn-primary flex-1 h-12">
            Continue
          </button>
        )}
      </div>
    </div>
  );
}