import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/app/Logo";
import { ArrowRight, ChevronRight } from "lucide-react";
import collabImg from "@/assets/onboard-collab.jpg";
import createImg from "@/assets/onboard-create.jpg";
import collectImg from "@/assets/onboard-collect.jpg";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome to Campayn" }] }),
  component: Welcome,
});

const SLIDES = [
  {
    image: collabImg,
    eyebrow: "Collab",
    title: "Brands that match your vibe",
    body: "Hand-picked paid campaigns that fit your niche, audience and average views. No cold pitching.",
    accent: "#3C4CE2",
    soft: "#ECEEFE",
  },
  {
    image: createImg,
    eyebrow: "Create",
    title: "AI scripts in your voice",
    body: "Hook, body and CTA written for your style. Edit, post and ship faster than your group chat replies.",
    accent: "#8B5CF6",
    soft: "#F1ECFE",
  },
  {
    image: collectImg,
    eyebrow: "Collect",
    title: "Paid to UPI in 24 hours",
    body: "Earnings shown upfront. No invoices, no follow-ups. 1 coin = 1 rupee. Withdraw above 100.",
    accent: "#B8860B",
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
      <div className="min-h-screen relative overflow-hidden grid place-items-center bg-white">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 45% at 50% 38%, #EEF0FE 0%, rgba(255,255,255,0) 70%)" }} />
        <div className="relative text-center">
          <div className="splash-logo inline-block">
            <Logo size={92} showWordmark={false} />
          </div>
          <div className="splash-word mt-6 text-[36px] font-black tracking-tight leading-none"
            style={{ color: "var(--primary)", letterSpacing: "-0.02em" }}>
            Campayn
          </div>
          <div className="splash-tag mt-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            Collab · Create · Collect
          </div>
          <div className="splash-bar mx-auto mt-7 h-[3px] w-24 rounded-full overflow-hidden bg-[color:var(--primary)]/10">
            <div className="splash-bar-fill h-full w-full origin-left bg-[color:var(--primary)]" />
          </div>
        </div>
        <style>{`
          .splash-logo{filter:drop-shadow(0 18px 28px rgba(60,76,226,0.28)) drop-shadow(0 4px 8px rgba(60,76,226,0.18));animation:splashLogoIn .9s cubic-bezier(.2,.8,.2,1) both}
          .splash-word{opacity:0;animation:splashRise .7s .35s cubic-bezier(.2,.8,.2,1) forwards}
          .splash-tag{opacity:0;animation:splashRise .7s .55s cubic-bezier(.2,.8,.2,1) forwards}
          .splash-bar{opacity:0;animation:splashRise .5s .75s ease-out forwards}
          .splash-bar-fill{transform:scaleX(0);animation:splashBar 1s .8s cubic-bezier(.6,.2,.2,1) forwards}
          @keyframes splashLogoIn{0%{opacity:0;transform:scale(.7) translateY(8px)}60%{opacity:1;transform:scale(1.06) translateY(0)}100%{opacity:1;transform:scale(1)}}
          @keyframes splashRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
          @keyframes splashBar{to{transform:scaleX(1)}}
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(180deg,#FFFFFF 0%,#F7F5FB 100%)" }}>
      <div className="relative max-w-md md:max-w-2xl w-full mx-auto flex-1 flex flex-col px-5 pt-6 md:pt-12 pb-7">
        <div className="flex items-center justify-between">
          <Logo size={32} />
          <Link to="/auth" className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition">Skip</Link>
        </div>

        <div ref={trackRef} onScroll={onScroll}
          className="mt-6 flex-1 flex overflow-x-auto snap-x-mandatory no-scrollbar -mx-5">
          {SLIDES.map((s, idx) => (
            <div key={idx} className="snap-start-c shrink-0 w-full px-5">
              <div className="relative h-[62vh] min-h-[480px] rounded-[28px] overflow-hidden flex flex-col bg-white border border-border shadow-[0_24px_60px_-28px_rgba(15,23,42,0.25)]">
                <div className="relative flex-1 overflow-hidden" style={{ background: s.soft }}>
                  <img
                    src={s.image}
                    alt={s.eyebrow}
                    loading={idx === 0 ? "eager" : "lazy"}
                    width={1024}
                    height={1024}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-white/85 backdrop-blur ring-1 ring-black/5"
                    style={{ color: s.accent }}>
                    {idx + 1} / {SLIDES.length} · {s.eyebrow}
                  </div>
                  <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white" />
                </div>
                <div className="p-6 pt-4">
                  <h2 className="text-[24px] font-black leading-tight tracking-tight text-foreground">{s.title}</h2>
                  <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
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
