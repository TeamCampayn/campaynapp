import { Link, useLocation } from "@tanstack/react-router";
import { Compass, Briefcase, Wallet, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { to: "/app/discover", icon: Compass, label: "Discover" },
  { to: "/app/campaigns", icon: Briefcase, label: "Campaigns" },
  { to: "/app/wallet", icon: Wallet, label: "Wallet" },
  { to: "/app/profile", icon: User, label: "Profile" },
];

export function SideNav() {
  const loc = useLocation();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="hidden md:flex flex-col w-64 border-r border-border bg-white h-screen sticky top-0">
      <div className="p-6 pb-2">
        <Link to="/app/discover" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg grad-primary grid place-items-center text-primary-foreground font-black text-lg">C</div>
          <span className="font-extrabold text-xl tracking-tight text-primary">Campayn</span>
        </Link>
      </div>
      
      <div className="flex-1 py-8 px-4 flex flex-col gap-2">
        {items.map(({ to, icon: Icon, label }) => {
          const active = loc.pathname.startsWith(to);
          return (
            <Link key={to} to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              active 
                ? "bg-primary/10 text-primary font-bold shadow-sm" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground font-medium"
            }`}>
              <Icon className="h-[20px] w-[20px]" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[15px]">{label}</span>
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-border mt-auto">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-all duration-200 font-medium"
        >
          <LogOut className="h-[20px] w-[20px]" strokeWidth={2} />
          <span className="text-[15px]">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
