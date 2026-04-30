import { Link, useLocation } from "@tanstack/react-router";
import { Compass, Briefcase, Wallet, Bell, User } from "lucide-react";

const items = [
  { to: "/app/discover", icon: Compass, label: "Discover" },
  { to: "/app/campaigns", icon: Briefcase, label: "Campaigns" },
  { to: "/app/wallet", icon: Wallet, label: "Wallet" },
  { to: "/app/inbox", icon: Bell, label: "Inbox" },
  { to: "/app/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl">
      <ul className="mx-auto max-w-md grid grid-cols-5 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, icon: Icon, label }) => {
          const active = loc.pathname.startsWith(to);
          return (
            <li key={to} className="text-center">
              <Link to={to} className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition ${active ? "text-coin" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span className={`text-[10px] font-semibold ${active ? "" : "opacity-80"}`}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
