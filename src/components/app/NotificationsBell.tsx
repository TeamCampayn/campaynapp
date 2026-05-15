import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, X, CheckCheck } from "lucide-react";

type Notif = { id: string; title: string; body: string | null; kind: string; read: boolean; created_at: string };

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const unread = items.filter(n => !n.read).length;

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(40);
    setItems((data ?? []) as Notif[]);
  }
  useEffect(() => { load(); }, []);

  async function markAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    load();
  }

  return (
    <>
      <button onClick={() => { setOpen(true); load(); }}
        className="relative h-10 w-10 grid place-items-center rounded-full bg-white border border-border">
        <Bell className="h-[18px] w-[18px] text-foreground" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full grad-primary grid place-items-center text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <div className="font-black text-[18px]">Notifications</div>
                <div className="text-[12px] text-muted-foreground">{unread} unread</div>
              </div>
              <div className="flex gap-2">
                {unread > 0 && (
                  <button onClick={markAll} className="h-9 px-3 rounded-full bg-secondary text-primary text-[12px] font-semibold inline-flex items-center gap-1">
                    <CheckCheck className="h-3.5 w-3.5" /> Mark all
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="h-9 w-9 rounded-full bg-secondary grid place-items-center">
                  <X className="h-4 w-4 text-primary" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {items.length === 0 && <div className="text-center text-muted-foreground text-sm py-12">You're all caught up 🎉</div>}
              {items.map(n => (
                <div key={n.id} className={`rounded-2xl p-3.5 border ${n.read ? "bg-white border-border" : "bg-secondary border-transparent"}`}>
                  <div className="flex items-start gap-2.5">
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13.5px] leading-snug">{n.title}</div>
                      {n.body && <div className="text-[12.5px] text-muted-foreground mt-0.5 leading-relaxed">{n.body}</div>}
                      <div className="text-[10.5px] text-muted-foreground mt-1.5">{new Date(n.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
