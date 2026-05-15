import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/kyc")({
  head: () => ({ meta: [{ title: "KYC - Campayn" }] }),
  component: Kyc,
});

function Kyc() {
  const [k, setK] = useState<any>({ pan_number: "", pan_name: "", aadhaar_last4: "", status: "not_started" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("kyc").select("*").eq("user_id", user.id).maybeSingle();
      if (data) setK(data);
    });
  }, []);

  async function submit() {
    if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(k.pan_number ?? "")) return toast.error("Invalid PAN");
    if (!k.pan_name) return toast.error("Enter name on PAN");
    if (!/^\d{4}$/.test(k.aadhaar_last4 ?? "")) return toast.error("Last 4 digits of Aadhaar");
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("kyc").update({
        pan_number: k.pan_number, pan_name: k.pan_name, aadhaar_last4: k.aadhaar_last4,
        status: "pending", submitted_at: new Date().toISOString(),
      }).eq("user_id", user!.id);
      if (error) throw error;
      toast.success("Submitted for verification");
      setK({ ...k, status: "pending" });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="px-5 pt-6 pb-10">
      <Link to="/app/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="mt-3 text-2xl font-black">KYC verification</h1>
      <p className="mt-1 text-sm text-muted-foreground">Required to withdraw above ₹10,000.</p>

      <div className="mt-5 cmp-card p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center"><ShieldCheck className="h-5 w-5 text-primary" /></div>
        <div className="flex-1 text-sm">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Status</div>
          <div className="font-bold capitalize">{(k.status ?? "not_started").replace("_"," ")}</div>
        </div>
        {k.status === "verified" && <span className="status status-paid">Verified</span>}
        {k.status === "pending" && <span className="status status-pending">In review</span>}
      </div>

      <div className="mt-5 space-y-3">
        <input value={k.pan_number ?? ""} onChange={e => setK({ ...k, pan_number: e.target.value.toUpperCase() })} placeholder="PAN (ABCDE1234F)" className={cls} maxLength={10} />
        <input value={k.pan_name ?? ""} onChange={e => setK({ ...k, pan_name: e.target.value })} placeholder="Name as on PAN" className={cls} />
        <input value={k.aadhaar_last4 ?? ""} onChange={e => setK({ ...k, aadhaar_last4: e.target.value.replace(/\D/g,"") })} placeholder="Last 4 of Aadhaar" className={cls} maxLength={4} />
      </div>
      <button disabled={busy || k.status === "verified"} onClick={submit} className="mt-5 btn-primary w-full disabled:opacity-50">
        {k.status === "verified" ? "Already verified" : busy ? "Submitting…" : "Submit for verification"}
      </button>
    </div>
  );
}
const cls = "cmp-input";