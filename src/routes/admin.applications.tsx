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
      await supabase.from("notifications").insert({ user_id: a.user_id, kind: "payment", title: `+${amt} Coins credited 🎉`, body: `${a.campaigns?.brand_name} paid out for "${a.campaigns?.title}".` });
    } else {
      await supabase.from("notifications").insert({ user_id: a.user_id, kind: "campaign", title: `Status: ${status}`, body: `${a.campaigns?.title}` });
    }
    toast.success("Updated"); load();
  }

  return (
    <div>
      <h2 className="text-xl font-black">Applications</h2>
      <ul className="mt-4 space-y-2">
        {items.map(a => (
          <li key={a.id} className="glass-card rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-bold truncate">{a.campaigns?.title}</div>
                <div className="text-xs text-muted-foreground">{a.campaigns?.brand_name} · {a.profiles?.display_name ?? "creator"} · est ₹{a.estimated_earning_inr}</div>
              </div>
              <span className="chip">{a.status}</span>
            </div>
            {a.post_url && <a href={a.post_url} target="_blank" className="text-xs text-coin underline truncate block mt-1" rel="noreferrer">{a.post_url}</a>}
            <div className="mt-2 flex gap-2 flex-wrap">
              {(NEXT[a.status] ?? []).map(s => (
                <button key={s} onClick={() => moveTo(a, s)} className="chip">{s}</button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}