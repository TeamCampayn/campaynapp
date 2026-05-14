import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { inrFmt } from "@/lib/auth";
import { ArrowDownToLine, ArrowUpRight, TrendingUp, Coins, Wallet as WalletIcon, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/wallet")({
  head: () => ({ meta: [{ title: "Wallet — Campayn" }] }),
  component: Wallet,
});

function Wallet() {
  const [profile, setProfile] = useState<any>(null);
  const [tx, setTx] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [upi, setUpi] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"all"|"earned"|"withdrawn">("all");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    setProfile(p);
    const { data: t } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    setTx(t ?? []);
    const { data: w } = await supabase.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    setWithdrawals(w ?? []);
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

  const filteredTx = tx.filter(t => {
    if (tab === "all") return true;
    if (tab === "earned") return t.amount_inr > 0;
    return t.amount_inr < 0;
  });

  return (
    <div className="px-5 pt-8 pb-10">
      <h1 className="text-[28px] font-black tracking-tight">Wallet</h1>

      {/* Hero balance */}
      <div className="mt-5 cmp-card overflow-hidden relative grad-coin p-6">
        <Coins
          aria-hidden
          className="absolute -right-6 -bottom-6 h-40 w-40 opacity-15"
          strokeWidth={1.5}
        />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-widest font-bold opacity-80">Creator Coins</div>
          <div className="mt-2 flex items-end gap-2">
            <div className="text-[44px] leading-none font-black tracking-tight">{(profile?.coin_balance ?? 0).toLocaleString("en-IN")}</div>
            <div className="text-sm font-bold opacity-80 mb-1.5">coins</div>
          </div>
          <div className="mt-1 text-[13px] opacity-80">≈ {inrFmt(profile?.coin_balance ?? 0)} · 1 coin = ₹1</div>
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => setOpen(true)}
              disabled={(profile?.coin_balance ?? 0) < 100}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-foreground text-background rounded-xl py-3 font-bold text-sm disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4" />Withdraw
            </button>
            <Link
              to="/app/discover"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white/85 text-foreground rounded-xl py-3 font-bold text-sm"
            >
              <ArrowUpRight className="h-4 w-4" />Earn more
            </Link>
          </div>
        </div>
      </div>

      {/* Lifetime stats */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="cmp-card p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            <TrendingUp className="h-3 w-3" /> Lifetime earned
          </div>
          <div className="mt-1.5 font-black text-lg">{inrFmt(profile?.lifetime_earnings ?? 0)}</div>
        </div>
        <div className="cmp-card p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            <WalletIcon className="h-3 w-3" /> Pending withdrawals
          </div>
          <div className="mt-1.5 font-black text-lg">
            {inrFmt(withdrawals.filter(w => w.status === "pending").reduce((s,w) => s + w.amount_inr, 0))}
          </div>
        </div>
      </div>

      {/* Pending withdrawals */}
      {withdrawals.filter(w => w.status === "pending").length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold text-[15px]">Withdrawal requests</h3>
          <ul className="mt-2 space-y-2">
            {withdrawals.filter(w => w.status === "pending").map(w => (
              <li key={w.id} className="cmp-card p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">UPI · {w.destination_value}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Requested {new Date(w.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-primary">{inrFmt(w.amount_inr)}</div>
                  <span className="status status-pending mt-1">Pending</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transactions */}
      <h3 className="mt-6 font-bold text-[15px]">Transactions</h3>
      <div className="mt-2.5 flex gap-2">
        {([["all","All"],["earned","Earned"],["withdrawn","Withdrawn"]] as const).map(([v,l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition ${
              tab === v ? "bg-primary text-primary-foreground" : "bg-white border border-border text-muted-foreground"
            }`}
          >{l}</button>
        ))}
      </div>

      {filteredTx.length === 0 && (
        <p className="mt-5 text-sm text-muted-foreground">No transactions yet. Apply to a campaign to start earning.</p>
      )}

      <ul className="mt-3 space-y-2">
        {filteredTx.map(t => {
          const positive = t.amount_inr >= 0;
          return (
            <li key={t.id} className="cmp-card p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="h-9 w-9 rounded-full grid place-items-center shrink-0"
                  style={{ background: positive ? "rgba(244,180,0,0.15)" : "rgba(100,116,139,0.12)" }}
                >
                  {positive
                    ? <ArrowDownToLine className="h-4 w-4" style={{ color: "var(--coin)" }} />
                    : <ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{t.description ?? t.kind}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(t.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short" })} · {t.status}
                  </div>
                </div>
              </div>
              <div className={`font-black text-sm ${positive ? "" : "text-muted-foreground"}`} style={positive ? { color: "var(--coin)" } : undefined}>
                {positive ? "+" : ""}{inrFmt(t.amount_inr)}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Withdraw sheet */}
      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-end sm:place-items-center" onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl">
            <div className="h-1 w-10 bg-muted rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg">Withdraw to UPI</h3>
              <button onClick={() => setOpen(false)} className="h-8 w-8 grid place-items-center rounded-full bg-secondary"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Min ₹100. Paid within 24 hours.</p>

            <div className="mt-4">
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Amount</label>
              <input
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/\D/g, ""))}
                placeholder="₹ 0"
                inputMode="numeric"
                className="cmp-input mt-1.5 text-lg font-bold"
              />
              <div className="mt-2 flex gap-2">
                {[100, 500, 1000].filter(v => v <= (profile?.coin_balance ?? 0)).map(v => (
                  <button key={v} onClick={() => setAmount(String(v))} className="chip">₹{v}</button>
                ))}
                {(profile?.coin_balance ?? 0) >= 100 && (
                  <button onClick={() => setAmount(String(profile.coin_balance))} className="chip">All ({inrFmt(profile.coin_balance)})</button>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">UPI ID</label>
              <input
                value={upi}
                onChange={e => setUpi(e.target.value)}
                placeholder="yourname@upi"
                className="cmp-input mt-1.5"
              />
            </div>

            <button disabled={busy} onClick={withdraw} className="btn-primary w-full mt-5">
              {busy ? "Requesting…" : `Withdraw ${amount ? inrFmt(parseInt(amount)) : ""}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
