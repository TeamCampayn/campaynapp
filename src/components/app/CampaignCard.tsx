import { Link } from "@tanstack/react-router";
import { Clock, Zap, Instagram, Youtube } from "lucide-react";
import { BrandCover } from "./BrandCover";

export type CampaignCardData = {
  id: string;
  brand_name: string;
  brand_logo_url: string | null;
  cover_image_url: string | null;
  title: string;
  cpv_paise: number;
  deadline: string | null;
  slots_total: number;
  slots_filled: number;
  platform: string;
  target_niches: string[];
  created_at?: string;
};

const compact = (n: number) => {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
};

function PlatformIcon({ p }: { p: string }) {
  if (p === "youtube") return <Youtube className="h-3.5 w-3.5" />;
  return <Instagram className="h-3.5 w-3.5" />;
}

function niceNiche(n: string) {
  return n.charAt(0).toUpperCase() + n.slice(1);
}

// Tiny gold moon-coin used inline, no dark pill background.
function CoinIcon({ size = 18 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, #F6D27A 0%, #D9A327 55%, #8C6510 100%)",
        display: "inline-block", flexShrink: 0,
        boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.25)",
      }}
    />
  );
}

function BrandPill({ name, logo, size = "md" }: { name: string; logo: string | null; size?: "sm" | "md" }) {
  const isSm = size === "sm";
  const dot = isSm ? "h-5 w-5 text-[10px]" : "h-6 w-6 text-[11px]";
  const pad = isSm ? "pl-1 pr-2.5 py-0.5 text-[11px]" : "pl-1 pr-3 py-1 text-[12px]";
  return (
    <div className={`inline-flex items-center gap-1.5 bg-white rounded-full ${pad} shadow-sm`}>
      <span className={`${dot} rounded-full grad-primary grid place-items-center text-white font-bold`}>
        {logo ? (
          <img src={logo} alt="" referrerPolicy="no-referrer"
            className={`${dot.split(" ").slice(0,2).join(" ")} rounded-full object-cover`} />
        ) : name[0]?.toUpperCase()}
      </span>
      <span className="font-semibold text-foreground">{name}</span>
    </div>
  );
}

export function CampaignCard({ c, avgViews }: { c: CampaignCardData; avgViews: number }) {
  const earning = Math.round(avgViews * (c.cpv_paise / 100));
  const lo = Math.round(earning * 0.7);
  const hi = Math.round(earning * 1.4);
  const hours = c.deadline ? Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 3600000)) : null;
  const days = hours === null ? null : Math.ceil(hours / 24);
  const closingSoon = hours !== null && hours <= 24;
  const cpvRupee = (c.cpv_paise / 100).toFixed(2);
  const niche = c.target_niches?.[0];
  const timeLabel = hours === null ? null : hours <= 24 ? `${hours}h left` : `${days}d left`;

  return (
    <Link to="/app/campaign/$id" params={{ id: c.id }}
      className="cmp-card block active:scale-[0.99] transition">
      <div className="relative">
        <BrandCover brandName={c.brand_name} brandLogoUrl={c.brand_logo_url}
          coverUrl={c.cover_image_url} height={210} />
        <div className="absolute top-3 left-3 z-10">
          <BrandPill name={c.brand_name} logo={c.brand_logo_url} />
        </div>
        {closingSoon && (
          <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-white shadow-sm"
            style={{ background: "linear-gradient(135deg,#FB923C 0%,#F97316 100%)" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-white" /> Closing soon
          </span>
        )}
      </div>
      <div className="px-4 pt-3.5 pb-4">
        <h3 className="text-[16px] font-bold leading-snug text-foreground line-clamp-2">{c.title}</h3>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <CoinIcon size={20} />
            <span className="text-[18px] font-black text-foreground tracking-tight">₹{compact(earning)}</span>
          </span>
          <span className="text-[13px] text-muted-foreground font-medium">/post</span>
          <span className="text-[12px] text-muted-foreground">~₹{compact(lo)}-₹{compact(hi)}</span>
        </div>
        <div className="mt-3 flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" fill="currentColor" /> ₹{cpvRupee}/view
          </span>
          <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-muted-foreground">
            <PlatformIcon p={c.platform} /> {c.platform === "youtube" ? "YouTube" : "Instagram"}
          </span>
          {niche && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: "var(--secondary)", color: "var(--primary)" }}>
              {niceNiche(niche)}
            </span>
          )}
          {timeLabel && (
            <span className="ml-auto inline-flex items-center gap-1 text-[12px] text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {timeLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function CampaignCardMini({ c, avgViews }: { c: CampaignCardData; avgViews: number }) {
  const earning = Math.round(avgViews * (c.cpv_paise / 100));
  const lo = Math.round(earning * 0.7);
  const hi = Math.round(earning * 1.4);
  const hours = c.deadline ? Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 3600000)) : null;
  const closingSoon = hours !== null && hours <= 24;
  const cpvRupee = (c.cpv_paise / 100).toFixed(2);
  const niche = c.target_niches?.[0];
  const timeLabel = hours === null ? null : hours <= 24 ? `${hours}h left` : `${Math.ceil(hours/24)}d left`;

  return (
    <Link to="/app/campaign/$id" params={{ id: c.id }}
      className="cmp-card block w-[300px] shrink-0 active:scale-[0.99] transition">
      <div className="relative">
        <BrandCover brandName={c.brand_name} brandLogoUrl={c.brand_logo_url}
          coverUrl={c.cover_image_url} height={170} />
        <div className="absolute top-2.5 left-2.5 z-10">
          <BrandPill name={c.brand_name} logo={c.brand_logo_url} size="sm" />
        </div>
        {closingSoon && (
          <span className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-sm"
            style={{ background: "linear-gradient(135deg,#FB923C 0%,#F97316 100%)" }}>
            Closing soon
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="font-bold text-[14.5px] leading-snug line-clamp-2 text-foreground min-h-[38px]">
          {c.title}
        </div>
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <CoinIcon size={18} />
          <span className="text-[15.5px] font-black text-foreground">₹{compact(earning)}</span>
          <span className="text-[11.5px] text-muted-foreground font-medium">/post</span>
          <span className="text-[10.5px] text-muted-foreground">~₹{compact(lo)}-₹{compact(hi)}</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-foreground">
            <Zap className="h-3 w-3 text-primary" fill="currentColor" /> ₹{cpvRupee}/view
          </span>
          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted-foreground">
            <Instagram className="h-3 w-3" /> Instagram
          </span>
          {niche && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
              style={{ background: "var(--secondary)", color: "var(--primary)" }}>
              {niceNiche(niche)}
            </span>
          )}
          {timeLabel && (
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {timeLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
