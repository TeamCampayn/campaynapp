import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/app/support")({
  head: () => ({ meta: [{ title: "Help - Campayn" }] }),
  component: Support,
});

const FAQ = [
  { q: "When will I get paid?", a: "Once the brand verifies your post (usually 24–72h), Coins are credited. Withdraw to UPI in 24h." },
  { q: "Why is my CPV different?", a: "CPV (Cost Per View) varies by brand and platform. Final earning = avg views × CPV / 1000." },
  { q: "How does AI script generation work?", a: "We use Lovable AI on the brief to suggest a 30-second Reels script. You can edit before submitting." },
  { q: "What if my application is rejected?", a: "Brands choose creators based on niche match. Connect socials and complete profile to improve odds." },
];

function Support() {
  return (
    <div className="px-5 pt-6 pb-10">
      <Link to="/app/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="mt-3 text-2xl font-black">Help & support</h1>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <a href="mailto:support@campayn.app" className="cmp-card p-4 flex flex-col items-center gap-2 active:scale-[0.99] transition">
          <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center"><Mail className="h-5 w-5 text-primary" /></div>
          <span className="text-sm font-semibold">Email</span>
        </a>
        <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" className="cmp-card p-4 flex flex-col items-center gap-2 active:scale-[0.99] transition">
          <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center"><MessageCircle className="h-5 w-5 text-primary" /></div>
          <span className="text-sm font-semibold">WhatsApp</span>
        </a>
      </div>

      <h3 className="mt-6 font-bold">FAQs</h3>
      <ul className="mt-3 space-y-2">
        {FAQ.map(({ q, a }) => (
          <li key={q} className="cmp-card p-4">
            <div className="font-semibold text-[14px]">{q}</div>
            <div className="mt-1 text-[13px] text-muted-foreground leading-relaxed">{a}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}