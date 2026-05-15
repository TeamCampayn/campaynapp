import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/applications")({
  component: AdminApps,
});

const NEXT: Record<string, string[]> = {
  applied: ["approved","rejected"],
  approved: ["script_approved","revision_requested","rejected"],
  script_submitted: ["script_approved","revision_requested","rejected"],
  script_approved: ["video_approved"],
  video_submitted: ["video_approved","revision_requested"],
  video_approved: ["posted"],
  posted: ["verified"],
  verified: ["paid"],
};

function AdminApps() {
  const [items, setItems] = useState<any[]>([]);
  async function load() {
    const { data } = await supabase.from("applications").select("*, campaigns(brand_name, title), profiles(display_name)").order("applied_at", { ascending: false }).limit(100);
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function moveTo(a: any, status: string) {
    const update: any = { status };
    if (status === "verified") {
      update.verified_views = a.estimated_earning_inr ? Math.round(a.estimated_earning_inr * 1000 / 50) : 50000;
      update.final_earning_inr = a.estimated_earning_inr;
    }
    const { error } = await supabase.from("applications").update(update).eq("id", a.id);
    if (error) return toast.error(error.message);
    if (status === "paid") {
      // credit coins
      const amt = a.final_earning_inr ?? a.estimated_earning_inr ?? 0;
      await supabase.from("transactions").insert({ user_id: a.user_id, amount_inr: amt, kind: "earning", description: `${a.campaigns?.brand_name} – ${a.campaigns?.title}`, application_id: a.id });
      const { data: prof } = await supabase.from("profiles").select("coin_balance, lifetime_earnings").eq("id", a.user_id).maybeSingle();
      await supabase.from("profiles").update({ coin_balance: (prof?.coin_balance ?? 0) + amt, lifetime_earnings: (prof?.lifetime_earnings ?? 0) + amt }).eq("id", a.user_id);
      await supabase.from("notifications").insert({ user_id: a.user_id, kind: "wallet", title: `+${amt} Coins credited 🎉`, body: `${a.campaigns?.brand_name} paid out for "${a.campaigns?.title}".` });
    } else {
      await supabase.from("notifications").insert({ user_id: a.user_id, kind: "campaign", title: `Status: ${status}`, body: `${a.campaigns?.title}` });
    }
    toast.success("Updated"); load();
  }

  return (
    <div>
      <h2 className="text-[22px] font-black tracking-tight">Applications</h2>
      <p className="text-sm text-muted-foreground mt-0.5">Review and progress creator submissions.</p>
      <ul className="mt-5 space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No applications yet.</p>}
        {items.map(a => (
          <li key={a.id} className="cmp-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{a.campaigns?.brand_name}</div>
                <div className="font-semibold text-[14px] truncate mt-0.5">{a.campaigns?.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  by <span className="font-semibold text-foreground">{a.profiles?.display_name ?? "creator"}</span> · est ₹{a.estimated_earning_inr ?? 0}
                </div>
              </div>
              <span className="chip whitespace-nowrap">{a.status.replace(/_/g, " ")}</span>
            </div>
            {a.post_url && (
              <a href={a.post_url} target="_blank" className="mt-2 text-[11px] text-primary underline truncate block" rel="noreferrer">
                ↗ {a.post_url}
              </a>
            )}
            {(NEXT[a.status] ?? []).length > 0 && (
              <div className="mt-3 pt-3 border-t border-border flex gap-2 flex-wrap">
                {(NEXT[a.status] ?? []).map(s => {
                  const isDanger = s === "rejected";
                  const isPay = s === "paid";
                  return (
                    <button key={s} onClick={() => moveTo(a, s)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition ${
                        isDanger ? "bg-destructive/10 text-destructive border border-destructive/20" :
                        isPay    ? "bg-coin text-coin-foreground border border-coin" :
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}>
                      {s.replace(/_/g, " ")}
                    </button>
                  );
                })}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}