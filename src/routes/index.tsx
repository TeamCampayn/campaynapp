import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Logo } from "@/components/app/Logo";
import { useAuth } from "@/lib/auth";
import { Sparkles, Coins, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Campayn - Brands ke deals, ek tap door." },
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
  // First-time visitors see the splash + 3-screen tour. Returning visitors who
  // already saw it get the marketing landing page.
  if (typeof window !== "undefined" && !localStorage.getItem("campayn.tour.v1")) {
    localStorage.setItem("campayn.tour.v1", "1");
    return <Navigate to="/welcome" />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* soft ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl"
             style={{ background: "radial-gradient(closest-side, rgba(59,79,228,0.22), transparent 70%)" }} />
        <div className="absolute top-1/3 -right-24 h-[360px] w-[360px] rounded-full opacity-70 blur-3xl"
             style={{ background: "radial-gradient(closest-side, rgba(244,180,0,0.22), transparent 70%)" }} />
      </div>

      <header className="relative z-10 px-5 pt-6 md:pt-10 flex items-center justify-between max-w-md md:max-w-6xl mx-auto w-full">
        <Logo />
        <Link to="/auth" className="text-sm font-semibold text-primary">Sign in</Link>
      </header>

      <main className="relative z-10 flex-1 px-5 pt-10 md:pt-20 pb-24 max-w-md md:max-w-6xl mx-auto w-full md:grid md:grid-cols-2 md:gap-16 lg:gap-24 md:items-center">
        {/* Left Side: Hero Text and CTA */}
        <div>
          <span className="chip"><Sparkles className="h-3 w-3" /> AI-powered · Made in India</span>
          <h1 className="mt-4 text-[44px] md:text-[56px] lg:text-[72px] font-extrabold leading-[1.02] tracking-tight text-foreground">
            Get paid for the{" "}
            <span style={{ background: "linear-gradient(135deg,#3B4FE4,#6C7EF5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              content
            </span>{" "}
            you already create.
          </h1>
          <p className="mt-4 text-muted-foreground text-[15.5px] md:text-lg leading-relaxed md:max-w-lg">
            Discover paid brand campaigns matched to your niche. See your exact earning <em>before</em> you apply, and withdraw to UPI within 24 hours.
          </p>

          <div className="hidden md:block mt-10">
            <Link to="/auth" className="btn-primary inline-flex justify-center items-center px-8 py-3.5 text-[15px] rounded-xl font-bold">
              Start earning - it's free
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Already on Campayn? <Link to="/auth" className="text-primary font-semibold">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Right Side: Features and Stats */}
        <div className="mt-10 md:mt-0 relative">
          <div className="absolute -top-32 -right-24 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl hidden md:block"
             style={{ background: "radial-gradient(closest-side, rgba(59,79,228,0.22), transparent 70%)" }} />
             
          {/* social proof row */}
          <div className="cmp-card p-4 md:p-6 grid grid-cols-3 text-center divide-x divide-border relative z-10 shadow-sm">
            <div><div className="text-lg md:text-2xl font-extrabold text-foreground">2K+</div><div className="text-[11px] md:text-[13px] font-medium text-muted-foreground mt-0.5">Creators</div></div>
            <div><div className="text-lg md:text-2xl font-extrabold text-foreground">120+</div><div className="text-[11px] md:text-[13px] font-medium text-muted-foreground mt-0.5">Brands</div></div>
            <div><div className="text-lg md:text-2xl font-extrabold text-foreground">₹18L+</div><div className="text-[11px] md:text-[13px] font-medium text-muted-foreground mt-0.5">Paid out</div></div>
          </div>

          <div className="mt-6 md:mt-6 space-y-3 md:space-y-4 relative z-10">
            {[
              { i: TrendingUp, t: "Earnings shown upfront", d: "We use your avg views × the brand's CPV - no guesswork." },
              { i: Coins,      t: "Creator Coins, real money", d: "1 Coin = ₹1. Withdraw to any UPI ID in under 24 hours." },
              { i: Sparkles,   t: "AI script & caption help",  d: "Hooks, captions and scripts written for your audience." },
            ].map(({ i: Icon, t, d }) => (
              <div key={t} className="cmp-card p-4 md:p-5 flex gap-3 md:gap-4 items-center shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl grad-primary grid place-items-center shrink-0">
                  <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-foreground md:text-[16px]">{t}</div>
                  <div className="text-sm md:text-[14px] text-muted-foreground leading-snug">{d}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="md:hidden mt-8">
            <Link to="/auth" className="btn-primary w-full">
              Start earning - it's free
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Already on Campayn? <Link to="/auth" className="text-primary font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
