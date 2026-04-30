import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { compactFmt, inrFmt } from "@/lib/auth";
import { Logo } from "@/components/app/Logo";
import { Clock, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/discover")({
  head: () => ({ meta: [{ title: "Discover — Campayn" }]}),
  component: Discover,
});

type Campaign = {
  id: string; brand_name: string; brand_logo_url: string | null; cover_image_url: string | null;
  title: string; tagline: string | null; cpv_paise: number; deadline: string | null;
  slots_total: number; slots_filled: number; platform: string; target_niches: string[];
};

function Discover() {
  const [items, setItems] = useState<Campaign[] | null>(null);
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);

  useEffect(() => {
    supabase.from("campaigns").select("*").eq("status", "active").order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as Campaign[]) ?? []));
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data));
    });
  }, []);

  return (
    <div className="px-5 pt-6">
      <header className="flex items-center justify-between">
        <Logo />
        <span className="chip"><Sparkles className="h-3 w-3 text-coin" /> Live</span>
      </header>

      <div className="mt-6">
        <p className="text-muted-foreground text-sm">Hi {profile?.display_name ?? "creator"} 👋</p>
        <h1 className="text-2xl font-black tracking-tight">Campaigns matched for you</h1>
      </div>

      {items === null && (
        <div className="mt-6 space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-44 rounded-2xl glass-card animate-pulse" />)}
        </div>
      )}

      {items?.length === 0 && (
        <div className="mt-10 text-center text-muted-foreground">No live campaigns right now. Check back soon.</div>
      )}

      <ul className="mt-5 space-y-4">
        {items?.map(c => {
          const days = c.deadline ? Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 86400000)) : null;
          // estimate: assume avg 50K views nano default, until OAuth wired
          const est = Math.round((50000 / 1000) * (c.cpv_paise / 100));
          return (
            <li key={c.id}>
              <Link to="/app/discover" className="block glass-card rounded-2xl overflow-hidden active:scale-[0.99] transition">
                {c.cover_image_url && (
                  <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${c.cover_image_url})` }} />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    {c.brand_logo_url && <img src={c.brand_logo_url} alt={c.brand_name} className="h-9 w-9 rounded-lg bg-white object-contain p-1" />}
                    <div className="min-w-0">
                      <div className="font-bold text-[15px] truncate">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.brand_name} · {c.platform}</div>
                    </div>
                  </div>
                  {c.tagline && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{c.tagline}</p>}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.target_niches.slice(0,3).map(n => <span key={n} className="chip capitalize">{n}</span>)}
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">You'll earn ~</div>
                      <div className="text-coin font-black text-xl leading-none">{inrFmt(est)}</div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {compactFmt(c.slots_total - c.slots_filled)} left</span>
                      {days !== null && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {days}d</span>}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
