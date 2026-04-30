import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/inbox")({
  head: () => ({ meta: [{ title: "Inbox — Campayn" }] }),
  component: Inbox,
});

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
      <h1 className="text-2xl font-black tracking-tight">Inbox</h1>
      <ul className="mt-5 space-y-2">
        {items?.map((n) => (
          <li key={n.id} className="glass-card rounded-2xl p-4">
            <div className="font-bold">{n.title}</div>
            {n.body && <div className="text-sm text-muted-foreground mt-0.5">{n.body}</div>}
          </li>
        ))}
        {items?.length === 0 && <p className="text-muted-foreground text-sm">No notifications yet.</p>}
      </ul>
    </div>
  );
}