import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Logo } from "@/components/app/Logo";
import { Check, ChevronRight, Instagram, Youtube, Search, MapPin, Lock } from "lucide-react";
import { INDIAN_CITIES } from "@/lib/india";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your profile - Campayn" }]}),
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
  const [done, setDone] = useState(() => {
    return localStorage.getItem("campayn_onboarding_completed") === "true";
  });
  const [instagramHandle, setInstagramHandle] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    async function checkOnboarding() {
      try {
        const { data, error } = await supabase.from("profiles").select("onboarding_complete").eq("id", user!.id).maybeSingle();
        if (error) {
          console.error("Error fetching onboarding status:", error);
        } else if (data?.onboarding_complete) {
          localStorage.setItem("campayn_onboarding_completed", "true");
          setDone(true);
        }
      } catch (err) {
        console.error("Failed to check onboarding status:", err);
      }
    }
    
    async function checkSocials() {
      try {
        const { data } = await supabase.from("social_connections").select("handle").eq("user_id", user!.id).eq("platform", "instagram").maybeSingle();
        if (data?.handle) {
          setInstagramHandle(data.handle);
        }
      } catch (err) {
        console.error("Failed to check social connections:", err);
      }
    }

    checkOnboarding();
    checkSocials();
  }, [user]);

  useEffect(() => {
    const onboardingSuccess = localStorage.getItem("campayn_onboarding_success");
    if (onboardingSuccess === "true") {
      localStorage.removeItem("campayn_onboarding_success");
      
      // Restore previous step's field values so the user doesn't lose any inputs!
      const rawData = localStorage.getItem("campayn_onboarding_data");
      if (rawData) {
        try {
          const parsed = JSON.parse(rawData);
          if (parsed.niches) setNiches(parsed.niches);
          if (parsed.languages) setLanguages(parsed.languages);
          if (parsed.city) setCity(parsed.city);
          if (parsed.bio) setBio(parsed.bio);
        } catch (e) {
          console.error("Failed to restore onboarding data:", e);
        }
        localStorage.removeItem("campayn_onboarding_data");
      }
      
      // Set to step 2 (Connect accounts step)
      setStep(2);
      toast.success("Instagram connected successfully! Let's complete your profile. 🚀");
    }
  }, []);

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
      
      // Set local storage flag to prevent page mount race conditions
      localStorage.setItem("campayn_onboarding_completed", "true");
      
      toast.success(skipSocial ? "Profile saved - you can connect Instagram later" : "Profile saved 🎯");
      nav({ to: "/app/discover" });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  function connectInstagram() {
    if (!user) { toast.error("Please log in first"); return; }
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID || "1951089435528507";
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://campayn-backend.onrender.com";
    const redirectUri = `${backendUrl}/api/auth/facebook/callback`;
    const scope = [
      'instagram_basic', 'instagram_manage_insights', 'pages_show_list',
      'pages_read_engagement', 'pages_manage_metadata', 'business_management', 'public_profile'
    ].join(',');
    
    // Save onboarding step in local storage to resume onboarding on redirect back!
    localStorage.setItem("campayn_onboarding_pending", "true");
    localStorage.setItem("campayn_onboarding_data", JSON.stringify({ niches, languages, city, bio }));
    
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${user.id}&auth_type=rerequest`;
    
    toast.loading("Redirecting to Facebook OAuth...");
    window.location.href = authUrl;
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
      sub: "City helps us match local brand campaigns. Bio is optional - boosts brand interest.",
      body: (
        <div className="space-y-5">
          <section>
            <label className="text-[13px] font-semibold text-foreground">City or town</label>
            <div className="relative mt-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={city || cityQ}
                onChange={e => { setCity(""); setCityQ(e.target.value); }}
                placeholder="Start typing - e.g. 'Gha' for Ghaziabad"
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
      sub: "Brands pay based on your real reach. Connect at least one - or skip and add later.",
      body: (
        <div className="space-y-3">
          {instagramHandle ? (
            <div className="w-full cmp-card p-4 flex items-center gap-3 border-emerald-500/20 bg-emerald-50/10">
              <div className="h-11 w-11 rounded-xl bg-emerald-500 grid place-items-center"><Check className="h-5 w-5 text-white" /></div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">Instagram Connected!</div>
                <div className="text-xs text-muted-foreground">@{instagramHandle} connected successfully</div>
              </div>
            </div>
          ) : (
            <button onClick={connectInstagram}
              className="w-full cmp-card p-4 flex items-center gap-3 active:scale-[0.99] transition">
              <div className="h-11 w-11 rounded-xl grad-primary grid place-items-center"><Instagram className="h-5 w-5 text-white" /></div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-foreground flex items-center gap-2">Connect Instagram <Lock className="h-3 w-3 text-muted-foreground" /></div>
                <div className="text-xs text-muted-foreground">Reels, posts & insights - official OAuth</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <button onClick={connectYouTubeSoon}
            className="w-full cmp-card p-4 flex items-center gap-3 active:scale-[0.99] transition">
            <div className="h-11 w-11 rounded-xl grad-primary grid place-items-center"><Youtube className="h-5 w-5 text-white" /></div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-foreground flex items-center gap-2">Connect YouTube <Lock className="h-3 w-3 text-muted-foreground" /></div>
              <div className="text-xs text-muted-foreground">Shorts & long-form - Google OAuth</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="cmp-card p-3.5 bg-secondary/60 text-[12px] text-muted-foreground flex gap-2">
            <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
            <span>Official Instagram OAuth is live! Connect your account to enable paid campaigns from top brands.</span>
          </div>
        </div>
      ),
      canNext: true,
    },
  ];

  const cur = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen flex flex-col px-5 pt-6 md:pt-12 pb-10 max-w-md md:max-w-2xl mx-auto w-full">
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