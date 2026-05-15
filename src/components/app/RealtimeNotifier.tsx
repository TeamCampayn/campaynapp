import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Check, Coins, Sparkles, AlertCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const STAGE_COPY: Record<string, { title: string; emoji: string }> = {
  approved:        { title: "You're approved! 🎉",        emoji: "🎉" },
  rejected:        { title: "Application not approved",   emoji: "😔" },
  script_approved: { title: "Script approved - go film!", emoji: "✍️" },
  revision_requested: { title: "Brand requested revisions", emoji: "📝" },
  video_approved:  { title: "Video approved",             emoji: "🎬" },
  posted:          { title: "Post is live - tracking views", emoji: "📈" },
  verified:        { title: "Verified ✅ Payout incoming", emoji: "✅" },
  paid:            { title: "Paid! Coins added to wallet", emoji: "💰" },
};

export function RealtimeNotifier({ user }: { user: User }) {
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`notif-${user.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n: any = payload.new;
          const Icon = n.kind === "earning" ? Coins : n.kind === "system" ? Sparkles : Bell;
          toast(n.title, {
            description: n.body ?? undefined,
            icon: <Icon className="h-4 w-4 text-primary" />,
          });
        })
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "applications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const oldS = (payload.old as any)?.status;
          const newS = (payload.new as any)?.status;
          if (!newS || oldS === newS) return;
          const meta = STAGE_COPY[newS];
          if (!meta) return;
          const Icon = newS === "paid" ? Coins : newS === "rejected" ? AlertCircle : Check;
          toast(meta.title, {
            description: `Status updated to ${newS.replace(/_/g, " ")}`,
            icon: <Icon className="h-4 w-4 text-primary" />,
          });
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);
  return null;
}