import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
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

export function CampaignCard({ c, avgViews }: { c: CampaignCardData; avgViews: number }) {
  const earning = Math.round((avgViews / 1) * (c.cpv_paise / 100));
  const days = c.deadline
    ? Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 86400000))
    : null;
  const isNew = c.created_at
    ? Date.now() - new Date(c.created_at).getTime() < 1000 * 60 * 60 * 24 * 4
    : false;
  const deadlineLabel =
    days === null ? null : days <= 1 ? "Closes today" : days <= 2 ? `${days}d left` : `${days}d left`;
  const deadlineWarn = days !== null && days <= 2;
  const cpvRupee = (c.cpv_paise / 100).toFixed(2);

  return (
    <Link
      to="/app/campaign/$id"
      params={{ id: c.id }}
      className="cmp-card block active:scale-[0.99] transition"
    >
      <BrandCover
        brandName={c.brand_name}
        brandLogoUrl={c.brand_logo_url}
        coverUrl={c.cover_image_url}
        height={168}
      >
        {isNew && (
          <span
            className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-[10px] font-bold tracking-widest text-white"
            style={{ background: "#22C55E" }}
          >
            NEW
          </span>
        )}
        <div className="absolute left-3.5 right-3.5 bottom-3.5 z-10 text-white">
          <div className="text-[11px] font-medium uppercase tracking-wider opacity-90">
            {c.brand_name}
          </div>
          <div className="text-[17px] font-semibold leading-snug line-clamp-2">{c.title}</div>
        </div>
      </BrandCover>
      <div className="px-3.5 py-3.5 flex items-center gap-2 flex-wrap">
        <span className="coin-pill">₹ {inr(earning)}</span>
        <span className="chip">₹{cpvRupee}/view</span>
        {deadlineLabel && (
          <span className={`chip ${deadlineWarn ? "chip-warn" : ""}`}>
            <Clock className="h-3 w-3" /> {deadlineLabel}
          </span>
        )}
      </div>
    </Link>
  );
}

export function CampaignCardMini({ c, avgViews }: { c: CampaignCardData; avgViews: number }) {
  const earning = Math.round((avgViews / 1) * (c.cpv_paise / 100));
  return (
    <Link
      to="/app/campaign/$id"
      params={{ id: c.id }}
      className="cmp-card block w-[200px] shrink-0 active:scale-[0.99] transition"
    >
      <BrandCover
        brandName={c.brand_name}
        brandLogoUrl={c.brand_logo_url}
        coverUrl={c.cover_image_url}
        height={100}
      />
      <div className="p-3">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {c.brand_name}
        </div>
        <div className="font-semibold text-[14px] leading-snug mt-1 line-clamp-2 text-foreground">
          {c.title}
        </div>
        <div className="mt-2.5">
          <span className="coin-pill">₹ {inr(earning)}</span>
        </div>
      </div>
    </Link>
  );
}
