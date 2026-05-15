import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Wallet, Megaphone, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/inbox")({
  head: () => ({ meta: [{ title: "Inbox — Campayn" }] }),
  component: Inbox,
});

const ICONS: Record<string, any> = { wallet: Wallet, campaign: Megaphone, system: Sparkles };

function Inbox() {
  const [items, setItems] = useState<any[] | null>(null);
  useEffect(() => {
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);
  return (
    <div className="px-5 pt-8">
      <h1 className="text-[28px] font-black tracking-tight">Inbox</h1>
      <p className="text-sm text-muted-foreground mt-1">Updates on your campaigns and payouts.</p>

      {items === null && <div className="mt-6 space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-white border border-border animate-pulse" />)}</div>}

      {items?.length === 0 && (
        <div className="mt-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-secondary grid place-items-center"><Bell className="h-7 w-7 text-primary" /></div>
          <p className="mt-4 font-semibold">All caught up</p>
          <p className="text-sm text-muted-foreground mt-1">We'll ping you when something happens.</p>
        </div>
      )}

      <ul className="mt-5 space-y-2">
        {items?.map((n) => {
          const Icon = ICONS[n.kind] ?? Bell;
          return (
            <li key={n.id} className="cmp-card p-4 flex gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-[14px] truncate">{n.title}</div>
                  <div className="text-[10px] text-muted-foreground shrink-0">{new Date(n.created_at).toLocaleDateString(undefined,{ month:"short", day:"numeric" })}</div>
                </div>
                {n.body && <div className="text-[13px] text-muted-foreground mt-0.5 leading-snug">{n.body}</div>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}