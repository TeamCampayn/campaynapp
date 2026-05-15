import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Youtube, ArrowLeft, Trash2, Plug } from "lucide-react";
import { toast } from "sonner";
import { compactFmt } from "@/lib/auth";

export const Route = createFileRoute("/app/connected")({
  head: () => ({ meta: [{ title: "Connected accounts - Campayn" }] }),
  component: Connected,
});

function Connected() {
  const [items, setItems] = useState<any[]>([]);
  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("social_connections").select("*").eq("user_id", user.id);
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add(platform: "instagram" | "youtube") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const followers = Math.floor(2000 + Math.random() * 80000);
    const avg_views = Math.floor(followers * (0.15 + Math.random() * 0.4));
    const tier = avg_views < 10000 ? "nano" : avg_views < 50000 ? "micro" : avg_views < 200000 ? "mid" : "macro";
    const { error } = await supabase.from("social_connections").insert({
      user_id: user.id, platform, handle: `@${platform}_creator`, followers, avg_views, engagement_rate: 3.5, tier, is_stub: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Connected (stub)"); load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("social_connections").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed"); load();
  }

  return (
    <div className="px-5 pt-6 pb-10">
      <Link to="/app/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="mt-3 text-2xl font-black">Connected accounts</h1>
      <p className="mt-1 text-sm text-muted-foreground">OAuth is stubbed - real Instagram/YouTube hookup ships soon.</p>

      <ul className="mt-5 space-y-3">
        {items.map(s => (
          <li key={s.id} className="cmp-card p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl grad-primary grid place-items-center ring-primary">
              {s.platform === "instagram" ? <Instagram className="h-5 w-5 text-primary-foreground" /> : <Youtube className="h-5 w-5 text-primary-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{s.handle}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{compactFmt(s.followers)} followers · avg {compactFmt(s.avg_views)} views</div>
              <span className="chip mt-1.5 capitalize">{s.tier}</span>
            </div>
            <button onClick={() => remove(s.id)} className="text-muted-foreground p-2 hover:text-destructive transition"><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => add("instagram")} className="cmp-card p-4 flex flex-col items-center gap-2 active:scale-[0.99] transition">
          <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center"><Instagram className="h-5 w-5 text-primary" /></div>
          <span className="text-sm font-semibold">Add Instagram</span>
        </button>
        <button onClick={() => add("youtube")} className="cmp-card p-4 flex flex-col items-center gap-2 active:scale-[0.99] transition">
          <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center"><Youtube className="h-5 w-5 text-primary" /></div>
          <span className="text-sm font-semibold">Add YouTube</span>
        </button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground inline-flex items-center gap-1"><Plug className="h-3 w-3" /> Stub mode - numbers are demo values until OAuth ships.</p>
    </div>
  );
}