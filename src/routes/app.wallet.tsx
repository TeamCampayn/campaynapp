import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { inrFmt } from "@/lib/auth";
import { ArrowDownToLine, ArrowUpRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/wallet")({
  head: () => ({ meta: [{ title: "Wallet — Campayn" }] }),
  component: Wallet,
});

function Wallet() {
  const [profile, setProfile] = useState<any>(null);
  const [tx, setTx] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [upi, setUpi] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    setProfile(p);
    const { data: t } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    setTx(t ?? []);
  }
  useEffect(() => { load(); }, []);

  async function withdraw() {
    const amt = parseInt(amount);
    if (!amt || amt < 100) return toast.error("Minimum withdrawal ₹100");
    if (amt > (profile?.coin_balance ?? 0)) return toast.error("Insufficient balance");
    if (!/^[\w.-]+@[\w.-]+$/.test(upi)) return toast.error("Enter a valid UPI ID");
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("withdrawals").insert({
        user_id: user!.id, amount_inr: amt, destination_kind: "upi", destination_value: upi,
      });
      if (error) throw error;
      toast.success("Withdrawal requested. Paid in 24h.");
      setOpen(false); setAmount(""); setUpi("");
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-black tracking-tight">Wallet</h1>
      <div className="mt-6 glass-card rounded-2xl p-5 ring-coin">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Balance</div>
        <div className="mt-1 text-4xl font-black text-coin">{profile?.coin_balance ?? 0} Coins</div>
        <div className="text-sm text-muted-foreground mt-1">≈ {inrFmt(profile?.coin_balance ?? 0)}</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => setOpen(true)} className="grad-coin rounded-xl py-2.5 font-bold text-sm">
            <ArrowDownToLine className="h-4 w-4 inline mr-1" />Withdraw
          </button>
          <Link to="/app/discover" className="bg-secondary text-secondary-foreground rounded-xl py-2.5 font-bold text-sm text-center">
            <ArrowUpRight className="h-4 w-4 inline mr-1" />Earn more
          </Link>
        </div>
      </div>

      <div className="mt-4 glass-card rounded-2xl p-4 text-xs text-muted-foreground">
        Lifetime earnings <span className="text-foreground font-bold">{inrFmt(profile?.lifetime_earnings ?? 0)}</span>
      </div>

      <h3 className="mt-6 font-bold">Transactions</h3>
      {tx.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No transactions yet. Apply to a campaign to start earning.</p>}
      <ul className="mt-3 space-y-2">
        {tx.map(t => (
          <li key={t.id} className="glass-card rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{t.description ?? t.kind}</div>
              <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()} · {t.status}</div>
            </div>
            <div className={`font-black ${t.amount_inr >= 0 ? "text-coin" : "text-muted-foreground"}`}>
              {t.amount_inr >= 0 ? "+" : ""}{inrFmt(t.amount_inr)}
            </div>
          </li>
        ))}
      </ul>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-end sm:place-items-center" onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md glass-card rounded-t-3xl sm:rounded-3xl p-5">
            <div className="h-1 w-10 bg-muted rounded-full mx-auto mb-4 sm:hidden" />
            <h3 className="font-black text-lg">Withdraw to UPI</h3>
            <p className="text-xs text-muted-foreground mt-1">Min ₹100. Paid in 24 hours.</p>
            <input value={amount} onChange={e => setAmount(e.target.value.replace(/\D/g, ""))} placeholder="Amount in ₹" inputMode="numeric"
              className="mt-4 w-full bg-input/60 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
            <input value={upi} onChange={e => setUpi(e.target.value)} placeholder="yourname@upi"
              className="mt-2 w-full bg-input/60 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
            <button disabled={busy} onClick={withdraw} className="mt-4 w-full grad-coin rounded-2xl py-3 font-bold ring-coin disabled:opacity-50">
              {busy ? "Requesting…" : "Confirm withdrawal"}
            </button>
            <button onClick={() => setOpen(false)} className="mt-2 w-full text-sm text-muted-foreground py-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}