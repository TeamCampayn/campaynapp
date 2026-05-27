import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Logo } from "@/components/app/Logo";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in - Campayn" }, { name: "description", content: "Sign in or create your Campayn creator account." }]}),
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
  const [googleBusy, setGoogleBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, name: mode === "signup" ? form.name : undefined });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email, password: form.password,
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

  async function google() {
    setGoogleBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/app/discover",
      });
      if (result.error) { toast.error((result.error as any)?.message ?? "Google sign-in failed"); return; }
      if (result.redirected) return;
      nav({ to: "/app/discover" });
    } catch (e: any) {
      toast.error(e?.message ?? "Google sign-in failed");
    } finally { setGoogleBusy(false); }
  }

  return (
    <div className="min-h-screen relative overflow-hidden md:flex">
      
      {/* Left side (Desktop only) */}
      <div className="hidden md:flex relative flex-col justify-center px-12 lg:px-20 flex-1 border-r border-border mesh-bg overflow-hidden bg-background">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 -left-20 h-96 w-96 rounded-full opacity-50 blur-3xl aurora"
            style={{ background: "radial-gradient(closest-side, rgba(117,134,245,0.55), transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full opacity-40 blur-3xl aurora"
            style={{ background: "radial-gradient(closest-side, rgba(240,171,252,0.5), transparent 70%)" }} />
        </div>
        
        <div className="relative z-10 max-w-lg">
          <Logo size={48} />
          <span className="mt-12 chip-glass self-start inline-flex">
            <Sparkles className="h-4 w-4 sparkle" /> Collab · Create · Collect
          </span>
          <h1 className="mt-6 text-[44px] lg:text-[54px] font-extrabold tracking-tight text-foreground leading-[1.05]">
            Campayn for Creators
          </h1>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            Join the new creator economy. Discover paid brand campaigns, use AI to write hooks, and get paid directly to your UPI in 24 hours.
          </p>
        </div>
      </div>

      {/* Right side (Auth Form) */}
      <div className="relative min-h-screen flex flex-col justify-center px-5 py-10 w-full md:w-[480px] lg:w-[560px] mx-auto md:mx-0 md:shrink-0 bg-background md:bg-white">
        {/* Mobile background */}
        <div aria-hidden className="absolute inset-0 mesh-bg md:hidden" />
        <div aria-hidden className="absolute inset-0 pointer-events-none md:hidden">
          <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full opacity-60 blur-3xl aurora"
            style={{ background: "radial-gradient(closest-side, rgba(117,134,245,0.55), transparent 70%)" }} />
          <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full opacity-50 blur-3xl aurora"
            style={{ background: "radial-gradient(closest-side, rgba(240,171,252,0.5), transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-md w-full mx-auto md:mx-0 md:px-10 lg:px-12">
          <div className="md:hidden">
            <Logo size={36} />
            <span className="mt-8 chip-glass inline-flex">
              <Sparkles className="h-3 w-3 sparkle" /> Collab · Create · Collect
            </span>
          </div>

          <h1 className="mt-3 md:mt-0 text-[30px] md:text-[36px] font-extrabold tracking-tight text-foreground leading-[1.1]">
            {mode === "signup" ? "Join the new creator economy" : "Welcome back"}
          </h1>
          <p className="mt-2 text-muted-foreground text-[14.5px] md:text-[16px]">
            {mode === "signup" ? "30 seconds. No card. Get ₹100 welcome coins." : "Sign in to continue earning."}
          </p>

          <button onClick={google} disabled={googleBusy} className="mt-7 md:mt-8 btn-google">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.5 29.3 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.5-.2-3-.5-4.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.8 16 19 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.5 29.3 4.5 24 4.5 16.3 4.5 9.6 8.8 6.3 14.7z"/><path fill="#4CAF50" d="M24 45.5c5.3 0 10-2 13.6-5.2l-6.3-5.3c-2 1.4-4.5 2.3-7.3 2.3-5.3 0-9.7-3.4-11.3-8L6.1 33.9C9.3 40 16.1 45.5 24 45.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.7 5l6.3 5.3C41.6 35.6 44.5 30.7 44.5 25c0-1.5-.2-3-.5-4.5z"/></svg>
            {googleBusy ? "Opening Google…" : "Continue with Google"}
          </button>

          <div className="mt-6 flex items-center gap-3 text-[12px] text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> or with email <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <input className="cmp-input" placeholder="Display name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} maxLength={40} />
            )}
            <input className="cmp-input" type="email" placeholder="Email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} maxLength={255} autoComplete="email" />
            <input className="cmp-input" type="password" placeholder="Password (8+ chars)" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} maxLength={72}
              autoComplete={mode === "signup" ? "new-password" : "current-password"} />

            <button type="submit" disabled={busy} className="btn-primary w-full mt-2 h-12">
              {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-sm text-muted-foreground hover:text-foreground transition">
              {mode === "signup"
                ? <>Already have an account? <span className="text-primary font-bold">Sign in</span></>
                : <>New to Campayn? <span className="text-primary font-bold">Create account</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
