import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, Shield, FileText, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings - Campayn" }] }),
  component: Settings,
});

function Settings() {
  const [notif, setNotif] = useState(true);
  useEffect(() => {
    const v = localStorage.getItem("campayn:notif"); if (v) setNotif(v === "1");
  }, []);
  function toggleNotif() {
    const next = !notif; setNotif(next); localStorage.setItem("campayn:notif", next ? "1" : "0");
    toast.success(`Notifications ${next ? "on" : "off"}`);
  }
  async function deleteAccount() {
    if (!confirm("Delete your account permanently?")) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // soft: sign out - hard delete requires admin endpoint
    await supabase.auth.signOut();
    toast.success("Signed out. Email support@campayn.app to delete data.");
    window.location.href = "/";
  }
  return (
    <div className="px-5 pt-6 pb-10">
      <Link to="/app/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="mt-3 text-2xl font-black">Settings</h1>

      <ul className="mt-5 space-y-2">
        <li className="cmp-card p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-secondary grid place-items-center"><Bell className="h-4 w-4 text-primary" /></div>
          <div className="flex-1">
            <div className="font-semibold text-sm">Push notifications</div>
            <div className="text-[11px] text-muted-foreground">Get notified when status changes</div>
          </div>
          <button onClick={toggleNotif} aria-label="Toggle notifications" className={`h-6 w-11 rounded-full transition flex items-center ${notif ? "bg-primary" : "bg-secondary"}`}>
            <div className={`h-5 w-5 bg-white shadow rounded-full transition-transform ${notif ? "translate-x-[22px]" : "translate-x-0.5"}`} />
          </button>
        </li>
        <li className="cmp-card p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-secondary grid place-items-center"><Shield className="h-4 w-4 text-primary" /></div>
          <span className="flex-1 font-semibold text-sm">Privacy policy</span>
        </li>
        <li className="cmp-card p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-secondary grid place-items-center"><FileText className="h-4 w-4 text-primary" /></div>
          <span className="flex-1 font-semibold text-sm">Terms of service</span>
        </li>
      </ul>

      <button onClick={deleteAccount} className="mt-6 w-full bg-destructive/10 text-destructive rounded-2xl py-3 font-semibold inline-flex items-center justify-center gap-2">
        <Trash2 className="h-4 w-4" /> Delete account
      </button>
    </div>
  );
}