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

  const STAT: Record<string,string> = { pending:"chip-warn", processing:"chip", paid:"chip-success", failed:"chip-error" };
  return (
    <div>
      <h2 className="text-[22px] font-black tracking-tight">Withdrawals</h2>
      <p className="text-sm text-muted-foreground mt-0.5">Approve and mark UPI payouts as paid.</p>
      <ul className="mt-5 space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No withdrawal requests.</p>}
        {items.map(w => (
          <li key={w.id} className="cmp-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-black text-lg text-coin">{inrFmt(w.amount_inr)}</div>
                <div className="text-[12px] text-foreground/80 mt-0.5">→ <span className="font-mono">{w.destination_value}</span></div>
                <div className="text-[11px] text-muted-foreground mt-1">{w.profiles?.display_name ?? "creator"} · {new Date(w.created_at).toLocaleDateString()}</div>
                {w.reference && <div className="text-[10px] text-muted-foreground mt-1 font-mono">ref: {w.reference}</div>}
              </div>
              <span className={`chip ${STAT[w.status] ?? ""}`}>{w.status}</span>
            </div>
            {(w.status === "pending" || w.status === "processing") && (
              <div className="mt-3 pt-3 border-t border-border flex gap-2 flex-wrap">
                {w.status === "pending" && (
                  <button onClick={() => setStatus(w, "processing")} className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-secondary text-primary">Mark processing</button>
                )}
                <button onClick={() => setStatus(w, "paid")} className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-coin text-coin-foreground">Mark paid</button>
                <button onClick={() => setStatus(w, "failed")} className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">Failed</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}