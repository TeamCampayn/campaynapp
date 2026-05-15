import { Link } from "@tanstack/react-router";
import { Clock, Zap, Instagram, Youtube, BadgeCheck } from "lucide-react";
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

const inr = (n: number) => new Intl.NumberFormat("en-IN").format(n);
const compact = (n: number) => {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 1 : 1).replace(/\.0$/, "") + "K";
  return String(n);
};

function PlatformIcon({ p }: { p: string }) {
  if (p === "youtube") return <Youtube className="h-3 w-3" />;
  return <Instagram className="h-3 w-3" />;
}

function niceNiche(n: string) {
  return n.charAt(0).toUpperCase() + n.slice(1);
}

export function CampaignCard({ c, avgViews }: { c: CampaignCardData; avgViews: number }) {
  const earning = Math.round((avgViews / 1) * (c.cpv_paise / 100));
  const lo = Math.round(earning * 0.7);
  const hi = Math.round(earning * 1.4);
  const hours = c.deadline
    ? Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 3600000))
    : null;
  const days = hours === null ? null : Math.ceil(hours / 24);
  const closingSoon = hours !== null && hours <= 24;
  const cpvRupee = (c.cpv_paise / 100).toFixed(2);
  const niche = c.target_niches?.[0];
  const timeLabel =
    hours === null ? null : hours <= 24 ? `${hours}h left` : `${days}d left`;

  return (
    <Link
      to="/app/campaign/$id"
      params={{ id: c.id }}
      className="cmp-card block active:scale-[0.99] transition"
    >
      <div className="relative">
        <BrandCover
          brandName={c.brand_name}
          brandLogoUrl={c.brand_logo_url}
          coverUrl={c.cover_image_url}
          height={200}
        />
        {/* brand pill top-left */}
        <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-white rounded-full pl-1 pr-3 py-1 shadow-sm">
          <span className="h-6 w-6 rounded-full grad-primary grid place-items-center text-white text-[11px] font-bold">
            {c.brand_logo_url ? (
              <img src={c.brand_logo_url} alt="" className="h-6 w-6 rounded-full object-cover" />
            ) : (
              c.brand_name[0]?.toUpperCase()
            )}
          </span>
          <span className="text-[12px] font-semibold text-foreground">{c.brand_name}</span>
        </div>
        {closingSoon && (
          <span
            className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold text-white shadow-sm"
            style={{ background: "linear-gradient(135deg,#FB923C 0%,#F97316 100%)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" /> Closing soon
          </span>
        )}
      </div>
      <div className="px-4 pt-3.5 pb-4">
        <h3 className="text-[15.5px] font-bold leading-snug text-foreground line-clamp-2">
          {c.title}
        </h3>
        <div className="mt-2.5 flex items-baseline gap-2 flex-wrap">
          <span className="coin-pill text-[13px]">₹{compact(earning)}</span>
          <span className="text-[12px] text-muted-foreground font-medium">/post</span>
          <span className="text-[12px] text-muted-foreground">~₹{compact(lo)}–₹{compact(hi)}</span>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-foreground">
            <Zap className="h-3 w-3 text-primary" fill="currentColor" /> ₹{cpvRupee}/view
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground">
            <PlatformIcon p={c.platform} /> {c.platform === "youtube" ? "YouTube" : "Instagram"}
          </span>
          {niche && (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: "var(--secondary)", color: "var(--primary)" }}
            >
              {niceNiche(niche)}
            </span>
          )}
          {timeLabel && (
            <span className="ml-auto inline-flex items-center gap-1 text-[12px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {timeLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function CampaignCardMini({ c, avgViews }: { c: CampaignCardData; avgViews: number }) {
  const earning = Math.round((avgViews / 1) * (c.cpv_paise / 100));
  const hours = c.deadline
    ? Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 3600000))
    : null;
  const closingSoon = hours !== null && hours <= 24;
  return (
    <Link
      to="/app/campaign/$id"
      params={{ id: c.id }}
      className="cmp-card block w-[280px] shrink-0 active:scale-[0.99] transition"
    >
      <div className="relative">
        <BrandCover
          brandName={c.brand_name}
          brandLogoUrl={c.brand_logo_url}
          coverUrl={c.cover_image_url}
          height={150}
        />
        <div className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 bg-white rounded-full pl-1 pr-2.5 py-0.5 shadow-sm">
          <span className="h-5 w-5 rounded-full grad-primary grid place-items-center text-white text-[10px] font-bold">
            {c.brand_logo_url ? (
              <img src={c.brand_logo_url} alt="" className="h-5 w-5 rounded-full object-cover" />
            ) : (
              c.brand_name[0]?.toUpperCase()
            )}
          </span>
          <span className="text-[11px] font-semibold text-foreground">{c.brand_name}</span>
        </div>
        {closingSoon && (
          <span
            className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-sm"
            style={{ background: "linear-gradient(135deg,#FB923C 0%,#F97316 100%)" }}
          >
            Closing soon
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="font-bold text-[14px] leading-snug line-clamp-2 text-foreground min-h-[36px]">
          {c.title}
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="coin-pill text-[12px]">₹{compact(earning)}</span>
          <span className="text-[11px] text-muted-foreground">/post</span>
        </div>
      </div>
    </Link>
  );
}
