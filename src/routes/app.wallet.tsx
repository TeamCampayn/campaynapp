import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { inrFmt } from "@/lib/auth";
import { ArrowDownToLine, ArrowUpRight, TrendingUp, ShieldAlert, Clock, X, Gift, IndianRupee, Repeat, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { RupeeCoin, compactInr } from "@/components/app/RupeeCoin";
import { NotificationsBell } from "@/components/app/NotificationsBell";

export const Route = createFileRoute("/app/wallet")({
  head: () => ({ meta: [{ title: "Wallet - Campayn" }] }),
  component: Wallet,
});

const KIND_META: Record<string, { label: string; icon: any; pos: boolean }> = {
  bonus:      { label: "Welcome bonus",  icon: Gift,         pos: true  },
  earning:    { label: "Campaign payout", icon: IndianRupee, pos: true  },
  referral:   { label: "Referral",       icon: Repeat,       pos: true  },
  withdrawal: { label: "Withdrawal",     icon: ArrowUpRight, pos: false },
  penalty:    { label: "Penalty",        icon: AlertTriangle, pos: false },
};

function Wallet() {
  const [profile, setProfile] = useState<any>(null);
  const [tx, setTx] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [upi, setUpi] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: p }, { data: t }, { data: w }, { data: live }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(80),
      supabase.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("applications").select("*, campaigns:legacy_campaigns(brand_name, cpv_paise, payout_window_days)").eq("user_id", user.id).in("status", ["posted","verified"]),
    ]);
    setProfile(p); setTx(t ?? []); setWithdrawals(w ?? []); setPending(live ?? []);
  }
  useEffect(() => { load(); }, []);

  async function withdraw() {
    const amt = parseInt(amount);
    const available = Math.max(0, (profile?.coin_balance ?? 0) - pendingTotal);
    if (!amt || amt < 100) return toast.error("Minimum withdrawal ₹100");
    if (amt > available) return toast.error("Insufficient available balance");
    if (!upi || !/^[\w.-]+@[\w.-]+$/.test(upi)) return toast.error("Enter a valid UPI ID");
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

  // Group transactions by month
  const grouped = tx.reduce((acc: Record<string, any[]>, t: any) => {
    const k = new Date(t.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    (acc[k] ||= []).push(t); return acc;
  }, {});

  // This month earnings
  const thisMonthStart = new Date(); thisMonthStart.setDate(1); thisMonthStart.setHours(0,0,0,0);
  const thisMonth = tx.filter(t => t.amount_inr > 0 && new Date(t.created_at) >= thisMonthStart)
    .reduce((s,t) => s + t.amount_inr, 0);
  const pendingTotal = withdrawals.filter(w => w.status === "pending" || w.status === "processing").reduce((s,w) => s + w.amount_inr, 0);
  const availableBalance = Math.max(0, (profile?.coin_balance ?? 0) - pendingTotal);

  return (
    <div className="px-5 pt-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-black tracking-tight">Wallet</h1>
        <NotificationsBell />
      </div>

      {/* Hero */}
      <div className="mt-5 cmp-card p-5 relative overflow-hidden grad-coin">
        <div className="absolute -right-8 -bottom-10 opacity-10">
          <RupeeCoin size={180} />
        </div>
        <div className="relative">
          <div className="text-[11px] uppercase tracking-widest font-bold opacity-80">Available balance</div>
          <div className="mt-2 flex items-end gap-2.5">
            <RupeeCoin size={38} />
            <div className="text-[44px] leading-none font-black tracking-tight">{availableBalance.toLocaleString("en-IN")}</div>
          </div>
          {pendingTotal > 0 && (
            <div className="text-[11px] opacity-75 mt-1">
              (₹{profile?.coin_balance?.toLocaleString("en-IN")} total - ₹{pendingTotal.toLocaleString("en-IN")} pending)
            </div>
          )}
          <div className="mt-2 text-[12.5px] opacity-85">1 coin = ₹1 · withdrawable to UPI / Bank</div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setOpen(true)} disabled={availableBalance < 100}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-foreground text-background rounded-xl py-3 font-bold text-sm disabled:opacity-50">
              <ArrowDownToLine className="h-4 w-4" />Withdraw
            </button>
            <Link to="/app/discover"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white/90 text-foreground rounded-xl py-3 font-bold text-sm">
              <ArrowUpRight className="h-4 w-4" />Earn more
            </Link>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <StatCard label="Lifetime" value={inrFmt(profile?.lifetime_earnings ?? 0)} />
        <StatCard label="This month" value={inrFmt(thisMonth)} accent />
        <StatCard label="Pending" value={inrFmt(pendingTotal)} muted />
      </div>

      {/* Pending payouts (live campaigns accruing views) */}
      {pending.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-bold text-[15px]">Maturing payouts</h3>
            <span className="text-[11px] font-semibold text-muted-foreground">{pending.length} live</span>
          </div>
          <ul className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {pending.map(a => {
              const due = a.payout_due_at ? new Date(a.payout_due_at) : null;
              const window = (a.campaigns?.payout_window_days ?? 7) * 86400000;
              const left = due ? Math.max(0, due.getTime() - Date.now()) : window;
              const elapsed = window - left;
              const pct = Math.max(2, Math.min(100, Math.round((elapsed / window) * 100)));
              const days = Math.floor(left / 86400000);
              const hours = Math.floor((left % 86400000) / 3600000);
              const projected = a.estimated_earning_inr ?? 0;
              return (
                <li key={a.id}>
                  <Link to="/app/application/$id" params={{ id: a.id }}
                    className="glass block p-3.5 rounded-2xl active:scale-[0.99] transition">
                    <div className="flex items-center gap-3">
                      <ProgressRing pct={pct} label={`${days}d`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[14px] truncate">{a.campaigns?.brand_name}</div>
                        <div className="text-[12px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {due ? `Matures in ${days}d ${hours}h` : "Awaiting first views"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Projected</div>
                        <div className="inline-flex items-center gap-1 mt-0.5">
                          <RupeeCoin size={14} />
                          <span className="font-black text-[15px]">{compactInr(projected)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Pending withdrawals */}
      {withdrawals.filter(w => w.status === "pending").length > 0 && (
        <section className="mt-6">
          <h3 className="font-bold text-[15px]">Withdrawal requests</h3>
          <ul className="mt-2.5 space-y-2 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {withdrawals.filter(w => w.status === "pending").map(w => (
              <li key={w.id} className="cmp-card p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[13.5px]">UPI · {w.destination_value}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Requested {new Date(w.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-primary">{inrFmt(w.amount_inr)}</div>
                  <span className="status status-pending mt-1">Pending</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Anti-fraud notice */}
      <div className="mt-6 rounded-2xl p-4 border" style={{ background: "rgba(239,67,67,0.06)", borderColor: "rgba(239,67,67,0.18)" }}>
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl grid place-items-center shrink-0" style={{ background: "rgba(239,67,67,0.12)" }}>
            <ShieldAlert className="h-5 w-5" style={{ color: "var(--destructive)" }} />
          </div>
          <div>
            <div className="font-bold text-[14px] text-foreground">Authentic views only</div>
            <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
              Our bot continuously checks for fake or bought views. Flagged content forfeits its payout and the creator may be permanently banned from Campayn.
            </p>
            <Link to="/app/support" className="mt-2 inline-block text-[12px] font-semibold text-primary">Read policy →</Link>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <h3 className="mt-7 font-bold text-[15px] flex items-center gap-1.5">
        <TrendingUp className="h-4 w-4 text-primary" /> Transactions
      </h3>
      {tx.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No transactions yet. Apply to a campaign to start earning.</p>}

      <div className="mt-3 space-y-5">
        {Object.entries(grouped).map(([month, list]) => (
          <div key={month}>
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{month}</div>
            <ul className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
              {list.map((t: any) => {
                const meta = KIND_META[t.kind] ?? KIND_META.earning;
                const Icon = meta.icon;
                const pos = (t.amount_inr ?? 0) >= 0;
                return (
                  <li key={t.id} className="cmp-card p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full grid place-items-center shrink-0"
                        style={{ background: pos ? "var(--secondary)" : "rgba(100,116,139,0.12)" }}>
                        <Icon className="h-4 w-4" style={{ color: pos ? "var(--primary)" : "var(--muted-foreground)" }} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[13.5px] truncate">{t.description ?? meta.label}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {t.status}
                        </div>
                      </div>
                    </div>
                    <div className="font-black text-[14px]" style={{ color: pos ? "var(--primary)" : "var(--muted-foreground)" }}>
                      {pos ? "+" : "−"}{inrFmt(Math.abs(t.amount_inr))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

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
              <input value={amount} onChange={e => setAmount(e.target.value.replace(/\D/g, ""))} placeholder="₹ 0" inputMode="numeric"
                className="cmp-input mt-1.5 text-lg font-bold" />
              <div className="mt-2 flex gap-2 flex-wrap">
                {[100, 500, 1000].filter(v => v <= availableBalance).map(v => (
                  <button key={v} onClick={() => setAmount(String(v))} className="chip">₹{v}</button>
                ))}
                {availableBalance >= 100 && (
                  <button onClick={() => setAmount(String(availableBalance))} className="chip">All ({inrFmt(availableBalance)})</button>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">UPI ID</label>
              <input value={upi} onChange={e => setUpi(e.target.value)} placeholder="yourname@upi" className="cmp-input mt-1.5" />
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

function StatCard({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
  return (
    <div className="glass p-3 rounded-2xl">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</div>
      <div className={`mt-1 font-black text-[15px] truncate ${accent ? "text-primary" : muted ? "text-muted-foreground" : ""}`}>{value}</div>
    </div>
  );
}

function ProgressRing({ pct, label }: { pct: number; label: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="relative h-[52px] w-[52px] shrink-0">
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
        <circle cx="28" cy="28" r={r} stroke="rgba(60,76,226,0.12)" strokeWidth="5" fill="none" />
        <circle cx="28" cy="28" r={r} stroke="url(#ring-grad)" strokeWidth="5" fill="none"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3C4CE2" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[11px] font-black text-primary tabular-nums">
        {label}
      </div>
    </div>
  );
}
