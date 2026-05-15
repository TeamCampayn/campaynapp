import { Link, useLocation } from "@tanstack/react-router";
import { Compass, Briefcase, Wallet, User } from "lucide-react";

const items = [
  { to: "/app/discover", icon: Compass, label: "Discover" },
  { to: "/app/campaigns", icon: Briefcase, label: "Campaigns" },
  { to: "/app/wallet", icon: Wallet, label: "Wallet" },
  { to: "/app/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-white/95 backdrop-blur-xl"
      style={{ boxShadow: "0 -8px 32px rgba(15,23,42,0.06)" }}>
      <ul className="mx-auto max-w-md grid grid-cols-4 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, icon: Icon, label }) => {
          const active = loc.pathname.startsWith(to);
          return (
            <li key={to} className="text-center">
              <Link to={to} className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}>
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.8} />
                <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
