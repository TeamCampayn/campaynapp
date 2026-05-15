import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/app/Logo";
import { Sparkles, Users, Wand2, Coins, ArrowRight, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome to Campayn" }] }),
  component: Welcome,
});

const SLIDES = [
  {
    icon: Users,
    eyebrow: "Collab",
    title: "Join brands that match your vibe",
    body: "We hand-pick paid campaigns that fit your niche, audience and avg views. No cold pitching, no DMs.",
    grad: "linear-gradient(135deg,#3C4CE2 0%,#7586F5 100%)",
  },
  {
    icon: Wand2,
    eyebrow: "Create",
    title: "AI scripts, hooks and captions",
    body: "Tap once and get a hook, body and CTA written in your voice. Edit, post, done. We help you ship faster.",
    grad: "linear-gradient(135deg,#7586F5 0%,#8B5CF6 60%,#F0ABFC 100%)",
  },
  {
    icon: Coins,
    eyebrow: "Collect",
    title: "Get paid to UPI in 24 hours",
    body: "Earnings shown upfront. No invoices, no chasing. 1 coin = ₹1, withdraw anytime above ₹100.",
    grad: "linear-gradient(135deg,#F0AC00 0%,#3C4CE2 100%)",
  },
];

function Welcome() {
  const nav = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [i, setI] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(t);
  }, []);

  function go(n: number) {
    setI(n);
    trackRef.current?.scrollTo({ left: trackRef.current.clientWidth * n, behavior: "smooth" });
  }

  function onScroll() {
    if (!trackRef.current) return;
    const idx = Math.round(trackRef.current.scrollLeft / trackRef.current.clientWidth);
    if (idx !== i) setI(idx);
  }

  function next() {
    if (i < SLIDES.length - 1) go(i + 1);
    else nav({ to: "/auth" });
  }

  if (showSplash) {
    return (
      <div className="min-h-screen relative overflow-hidden mesh-dark grid place-items-center">
        <div aria-hidden className="absolute -top-40 -left-32 h-[480px] w-[480px] rounded-full opacity-60 blur-3xl aurora"
          style={{ background: "radial-gradient(closest-side, rgba(117,134,245,0.55), transparent 70%)" }} />
        <div aria-hidden className="absolute bottom-0 -right-32 h-[480px] w-[480px] rounded-full opacity-50 blur-3xl aurora"
          style={{ background: "radial-gradient(closest-side, rgba(240,171,252,0.55), transparent 70%)" }} />
        <div className="relative text-center logo-in">
          <Logo size={56} />
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white/90 text-[12px] font-semibold backdrop-blur">
            <Sparkles className="h-3 w-3 sparkle" /> Collab · Create · Collect
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <div aria-hidden className="absolute inset-0 mesh-bg" />
      <div className="relative max-w-md w-full mx-auto flex-1 flex flex-col px-5 pt-6 pb-7">
        <div className="flex items-center justify-between">
          <Logo size={32} />
          <Link to="/auth" className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition">Skip</Link>
        </div>

        <div ref={trackRef} onScroll={onScroll}
          className="mt-6 flex-1 flex overflow-x-auto snap-x-mandatory no-scrollbar -mx-5">
          {SLIDES.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="snap-start-c shrink-0 w-full px-5">
                <div className="relative h-[58vh] min-h-[420px] rounded-[28px] overflow-hidden p-6 flex flex-col text-white shadow-[0_20px_60px_-20px_rgba(60,76,226,0.45)]"
                  style={{ background: s.grad }}>
                  <div aria-hidden className="absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-30 blur-3xl aurora"
                    style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.6), transparent 70%)" }} />
                  <div className="relative">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold tracking-widest uppercase">
                      {idx + 1} / {SLIDES.length} · {s.eyebrow}
                    </div>
                  </div>
                  <div className="relative flex-1 grid place-items-center">
                    <div className="h-28 w-28 rounded-3xl bg-white/15 backdrop-blur grid place-items-center logo-in">
                      <Icon className="h-14 w-14" strokeWidth={1.6} />
                    </div>
                  </div>
                  <div className="relative">
                    <h2 className="text-[26px] font-black leading-tight tracking-tight">{s.title}</h2>
                    <p className="mt-2 text-[14.5px] opacity-90 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          {SLIDES.map((_, idx) => (
            <button key={idx} onClick={() => go(idx)} aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-7 bg-primary" : "w-1.5 bg-muted"}`} />
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3">
          {i < SLIDES.length - 1 ? (
            <button onClick={next} className="btn-primary flex-1">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <Link to="/auth" className="btn-primary flex-1">
              Start earning <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}