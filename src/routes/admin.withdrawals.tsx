import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { inrFmt } from "@/lib/auth";

export const Route = createFileRoute("/admin/withdrawals")({
  component: AdminWd,
});

function AdminWd() {
  const [items, setItems] = useState<any[]>([]);
  async function load() {
    const { data } = await supabase.from("withdrawals").select("*, profiles(display_name)").order("created_at", { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(w: any, status: "pending" | "processing" | "paid" | "failed") {
    const { error } = await supabase.from("withdrawals").update({ status, reference: status === "paid" ? `TXN${Date.now()}` : w.reference }).eq("id", w.id);
    if (error) return toast.error(error.message);
    if (status === "paid") {
      // debit
      await supabase.from("transactions").insert({ user_id: w.user_id, amount_inr: -w.amount_inr, kind: "withdrawal", status: "completed", description: `Withdrawal to ${w.destination_value}` });
      const { data: prof } = await supabase.from("profiles").select("coin_balance").eq("id", w.user_id).maybeSingle();
      await supabase.from("profiles").update({ coin_balance: Math.max(0, (prof?.coin_balance ?? 0) - w.amount_inr) }).eq("id", w.user_id);
      await supabase.from("notifications").insert({ user_id: w.user_id, kind: "wallet", title: `Withdrawal paid`, body: `${inrFmt(w.amount_inr)} sent to ${w.destination_value}` });
    }
    toast.success("Updated"); load();
  }

  return (
    <div>
      <h2 className="text-xl font-black">Withdrawals</h2>
      <ul className="mt-4 space-y-2">
        {items.map(w => (
          <li key={w.id} className="glass-card rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{inrFmt(w.amount_inr)} → {w.destination_value}</div>
                <div className="text-xs text-muted-foreground">{w.profiles?.display_name ?? "creator"} · {new Date(w.created_at).toLocaleDateString()}</div>
              </div>
              <span className="chip">{w.status}</span>
            </div>
            <div className="mt-2 flex gap-2">
              {w.status === "pending" && <>
                <button onClick={() => setStatus(w, "processing")} className="chip">processing</button>
                <button onClick={() => setStatus(w, "paid")} className="chip ring-2 ring-coin text-coin">mark paid</button>
                <button onClick={() => setStatus(w, "failed")} className="chip">failed</button>
              </>}
              {w.status === "processing" && <button onClick={() => setStatus(w, "paid")} className="chip ring-2 ring-coin text-coin">mark paid</button>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}