import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/app/Logo";
import { Users, Wand2, Coins, ArrowRight, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome to Campayn" }] }),
  component: Welcome,
});

const SLIDES = [
  {
    icon: Users,
    eyebrow: "Collab",
    title: "Brands that match your vibe",
    body: "We hand-pick paid campaigns that fit your niche, audience and average views. No cold pitching. No DMs.",
    accent: "#3C4CE2",
    soft: "#ECEEFE",
  },
  {
    icon: Wand2,
    eyebrow: "Create",
    title: "AI-assisted scripts and captions",
    body: "Hook, body and CTA written in your voice. Edit, post and ship faster than your group chat replies.",
    accent: "#8B5CF6",
    soft: "#F1ECFE",
  },
  {
    icon: Coins,
    eyebrow: "Collect",
    title: "Get paid to UPI in 24 hours",
    body: "Earnings shown upfront. No invoices. 1 coin = 1 rupee. Withdraw any amount above 100.",
    accent: "#F0AC00",
    soft: "#FFF5E0",
  },
];

function Welcome() {
  const nav = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [i, setI] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1600);
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
      <div className="min-h-screen relative overflow-hidden grid place-items-center"
        style={{ background: "linear-gradient(180deg,#FFFFFF 0%,#F4F2FE 100%)" }}>
        <div className="relative text-center logo-in">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-[28px] bg-white shadow-[0_20px_50px_-15px_rgba(60,76,226,0.35)] overflow-hidden">
            <Logo size={72} showWordmark={false} />
          </div>
          <div className="mt-6 text-[34px] font-extrabold tracking-tight" style={{ color: "var(--primary)" }}>
            campayn
          </div>
          <div className="mt-2 text-[14px] font-semibold text-muted-foreground tracking-wide">
            Collaborate · Create · Collect
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(180deg,#FFFFFF 0%,#F7F5FB 100%)" }}>
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
                <div className="relative h-[58vh] min-h-[440px] rounded-[28px] overflow-hidden p-7 flex flex-col bg-white border border-border shadow-[0_20px_50px_-25px_rgba(15,23,42,0.18)]">
                  <div className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase"
                    style={{ background: s.soft, color: s.accent }}>
                    {idx + 1} / {SLIDES.length} · {s.eyebrow}
                  </div>
                  <div className="flex-1 grid place-items-center">
                    <div className="h-28 w-28 rounded-3xl grid place-items-center logo-in"
                      style={{ background: s.soft }}>
                      <Icon className="h-14 w-14" strokeWidth={1.6} style={{ color: s.accent }} />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-[26px] font-black leading-tight tracking-tight text-foreground">{s.title}</h2>
                    <p className="mt-2 text-[14.5px] text-muted-foreground leading-relaxed">{s.body}</p>
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
