import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/app/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Campayn" }, { name: "description", content: "Sign in or create your Campayn creator account." }]}),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Min 8 characters").max(72),
  name: z.string().trim().min(2, "Tell us your name").max(40).optional(),
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, name: mode === "signup" ? form.name : undefined });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { display_name: form.name }, emailRedirectTo: window.location.origin + "/app/discover" },
        });
        if (error) throw error;
        toast.success("Welcome to Campayn 🎉");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      nav({ to: "/app/discover" });
    } catch (e: any) {
      toast.error(e?.message ?? "Something went wrong");
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen flex flex-col px-5 pt-8 pb-10 max-w-md mx-auto w-full">
      <Logo />
      <h1 className="mt-10 text-3xl font-black tracking-tight">{mode === "signup" ? "Create your creator account" : "Welcome back"}</h1>
      <p className="mt-2 text-muted-foreground text-sm">{mode === "signup" ? "Takes 30 seconds. No card needed." : "Sign in to continue earning."}</p>

      <form onSubmit={submit} className="mt-8 space-y-3">
        {mode === "signup" && (
          <input className="w-full bg-input/60 border border-border rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-primary"
            placeholder="Display name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} maxLength={40} />
        )}
        <input className="w-full bg-input/60 border border-border rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-primary"
          type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} maxLength={255} autoComplete="email" />
        <input className="w-full bg-input/60 border border-border rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-primary"
          type="password" placeholder="Password (8+ chars)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} maxLength={72} autoComplete={mode === "signup" ? "new-password" : "current-password"} />

        <button type="submit" disabled={busy} className="w-full grad-coin py-3.5 rounded-2xl font-bold ring-coin transition active:scale-[0.98] disabled:opacity-60">
          {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="mt-6 text-sm text-muted-foreground text-center">
        {mode === "signup" ? <>Already have an account? <span className="text-foreground font-semibold">Sign in</span></> : <>New to Campayn? <span className="text-foreground font-semibold">Create account</span></>}
      </button>
    </div>
  );
}
