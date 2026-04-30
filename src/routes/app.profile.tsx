import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — Campayn" }] }),
  component: Profile,
});

function Profile() {
  const [p, setP] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setP(data);
    });
  }, []);
  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    window.location.href = "/";
  }
  return (
    <div className="px-5 pt-8">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl grad-primary grid place-items-center text-2xl font-black text-primary-foreground">
          {(p?.display_name ?? "C").slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="text-xl font-black">{p?.display_name ?? "Creator"}</div>
          <div className="text-xs text-muted-foreground">Referral: {p?.referral_code ?? "—"}</div>
        </div>
      </div>
      <div className="mt-6 glass-card rounded-2xl p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Profile completion</div>
        <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full grad-coin" style={{ width: `${p?.profile_completion ?? 20}%` }} />
        </div>
        <div className="mt-2 text-sm">{p?.profile_completion ?? 20}% complete</div>
      </div>
      <p className="mt-4 text-muted-foreground text-sm">
        Edit profile, connected accounts, analytics, referrals, KYC, settings, support and admin panel ship in the next build pass.
      </p>
      <button onClick={signOut} className="mt-6 w-full bg-secondary text-secondary-foreground rounded-2xl py-3 font-semibold">
        Sign out
      </button>
    </div>
  );
}