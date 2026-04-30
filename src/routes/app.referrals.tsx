import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Copy, Gift } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/referrals")({
  head: () => ({ meta: [{ title: "Refer & earn — Campayn" }] }),
  component: Referrals,
});

function Referrals() {
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("referral_code").eq("id", user.id).maybeSingle();
      setCode(data?.referral_code ?? null);
    });
  }, []);
  async function copy() {
    if (!code) return;
    const url = `${window.location.origin}/auth?ref=${code}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  }
  async function share() {
    if (!code) return;
    const url = `${window.location.origin}/auth?ref=${code}`;
    if (navigator.share) { try { await navigator.share({ title: "Join Campayn", text: "Earn from brand campaigns 🚀", url }); } catch {} }
    else copy();
  }
  return (
    <div className="px-5 pt-6 pb-10">
      <Link to="/app/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="mt-3 text-2xl font-black">Refer & earn</h1>
      <div className="mt-6 glass-card rounded-3xl p-6 text-center ring-coin">
        <Gift className="h-10 w-10 text-coin mx-auto" />
        <div className="mt-3 text-sm text-muted-foreground">Refer creators, get</div>
        <div className="text-3xl font-black text-coin">100 Coins each</div>
        <div className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">Your code</div>
        <div className="mt-1 font-black text-2xl tracking-widest">{code ?? "—"}</div>
        <div className="mt-5 flex gap-2">
          <button onClick={copy} className="flex-1 bg-secondary text-secondary-foreground rounded-xl py-3 font-semibold inline-flex items-center justify-center gap-1.5"><Copy className="h-4 w-4" />Copy link</button>
          <button onClick={share} className="flex-1 grad-coin rounded-xl py-3 font-bold ring-coin">Share</button>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground text-center">Reward credits when your referral completes their first paid campaign.</p>
    </div>
  );
}