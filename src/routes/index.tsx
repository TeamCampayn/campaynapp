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
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-5 pt-6 flex items-center justify-between max-w-md mx-auto w-full">
        <Logo />
        <Link to="/auth" className="text-sm font-semibold text-primary-blue">Sign in</Link>
      </header>

      <main className="flex-1 px-5 pt-10 pb-24 max-w-md mx-auto w-full">
        <span className="chip"><Sparkles className="h-3 w-3" /> Made for Indian creators</span>
        <h1 className="mt-4 text-[40px] font-extrabold leading-[1.05] tracking-tight text-foreground">
          Brands ke deals,{" "}
          <span style={{ background: "linear-gradient(135deg,#3B4FE4,#6C7EF5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ek tap door.
          </span>
        </h1>
        <p className="mt-3 text-muted-foreground text-[15px] leading-relaxed">
          See exactly how much each campaign will pay <em>before</em> you apply. Earn Creator Coins. Withdraw to UPI in 24 hours.
        </p>

        <div className="mt-8 space-y-3">
          {[
            { i: TrendingUp, t: "Personalized earnings", d: "We use your avg views × CPV to show your real number." },
            { i: Coins,      t: "Get paid in Creator Coins", d: "1 Coin = ₹1. Withdraw to UPI or bank." },
            { i: Sparkles,   t: "AI script & caption help",  d: "Powered by Lovable AI inside the app." },
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
          Get started — it's free
        </Link>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Already on Campayn? <Link to="/auth" className="text-primary-blue font-semibold">Sign in</Link>
        </p>
      </main>
    </div>
  );
}
