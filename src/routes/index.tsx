import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Logo } from "@/components/app/Logo";
import { useAuth } from "@/lib/auth";
import { Sparkles, Coins, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Campayn — Brands ke deals, ek tap door." },
    { name: "description", content: "India's AI-powered creator marketing app. Discover paid campaigns, see your earnings before you apply, and withdraw to UPI." },
    { property: "og:title", content: "Campayn Creator" },
    { property: "og:description", content: "Apne views se kamai dekho. Pehle." },
  ]}),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (user) return <Navigate to="/app/discover" />;

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* soft ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl"
             style={{ background: "radial-gradient(closest-side, rgba(59,79,228,0.22), transparent 70%)" }} />
        <div className="absolute top-1/3 -right-24 h-[360px] w-[360px] rounded-full opacity-70 blur-3xl"
             style={{ background: "radial-gradient(closest-side, rgba(244,180,0,0.22), transparent 70%)" }} />
      </div>

      <header className="relative z-10 px-5 pt-6 flex items-center justify-between max-w-md mx-auto w-full">
        <Logo />
        <Link to="/auth" className="text-sm font-semibold text-primary-blue">Sign in</Link>
      </header>

      <main className="relative z-10 flex-1 px-5 pt-10 pb-24 max-w-md mx-auto w-full">
        <span className="chip"><Sparkles className="h-3 w-3" /> AI-powered · Made in India</span>
        <h1 className="mt-4 text-[44px] font-extrabold leading-[1.02] tracking-tight text-foreground">
          Get paid for the{" "}
          <span style={{ background: "linear-gradient(135deg,#3B4FE4,#6C7EF5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            content
          </span>{" "}
          you already create.
        </h1>
        <p className="mt-4 text-muted-foreground text-[15.5px] leading-relaxed">
          Discover paid brand campaigns matched to your niche. See your exact earning <em>before</em> you apply, and withdraw to UPI within 24 hours.
        </p>

        {/* social proof row */}
        <div className="mt-6 cmp-card p-4 grid grid-cols-3 text-center divide-x divide-border">
          <div><div className="text-lg font-extrabold text-foreground">2K+</div><div className="text-[11px] text-muted-foreground mt-0.5">Creators</div></div>
          <div><div className="text-lg font-extrabold text-foreground">120+</div><div className="text-[11px] text-muted-foreground mt-0.5">Brands</div></div>
          <div><div className="text-lg font-extrabold text-foreground">₹18L+</div><div className="text-[11px] text-muted-foreground mt-0.5">Paid out</div></div>
        </div>

        <div className="mt-6 space-y-3">
          {[
            { i: TrendingUp, t: "Earnings shown upfront", d: "We use your avg views × the brand's CPV — no guesswork." },
            { i: Coins,      t: "Creator Coins, real money", d: "1 Coin = ₹1. Withdraw to any UPI ID in under 24 hours." },
            { i: Sparkles,   t: "AI script & caption help",  d: "Hooks, captions and scripts written for your audience." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="cmp-card p-4 flex gap-3">
              <div className="h-10 w-10 rounded-xl grad-primary grid place-items-center shrink-0">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-foreground">{t}</div>
                <div className="text-sm text-muted-foreground">{d}</div>
              </div>
            </div>
          ))}
        </div>

        <Link to="/auth" className="mt-8 btn-primary w-full">
          Start earning — it's free
        </Link>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Already on Campayn? <Link to="/auth" className="text-primary-blue font-semibold">Sign in</Link>
        </p>
      </main>
    </div>
  );
}
