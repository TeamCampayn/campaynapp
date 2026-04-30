import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/wallet")({
  head: () => ({ meta: [{ title: "Wallet — Campayn" }] }),
  component: () => (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-black tracking-tight">Creator Coins Wallet</h1>
      <div className="mt-6 glass-card rounded-2xl p-5 ring-coin">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Balance</div>
        <div className="mt-1 text-4xl font-black text-coin">0 Coins</div>
        <div className="text-sm text-muted-foreground mt-1">≈ ₹0</div>
      </div>
      <p className="mt-4 text-muted-foreground text-sm">
        Transactions, withdraw to UPI/bank, and KYC ship in the next build pass.
      </p>
    </div>
  ),
});