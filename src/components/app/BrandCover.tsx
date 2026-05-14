// Gradient brand cover (PRD §7.4 — used on Discover cards & Campaign Detail hero)
type Props = {
  brandName: string;
  brandLogoUrl?: string | null;
  coverUrl?: string | null;
  height?: number;
  children?: React.ReactNode;
};

// Deterministic color from brand name → vibrant gradient pair
function brandColors(name: string): [string, string] {
  const palette: [string, string][] = [
    ["#3B4FE4", "#6C7EF5"], ["#F4B400", "#FF8A00"], ["#22C55E", "#10B981"],
    ["#EF4444", "#F472B6"], ["#8B5CF6", "#EC4899"], ["#0EA5E9", "#22D3EE"],
    ["#F59E0B", "#FB923C"], ["#14B8A6", "#06B6D4"], ["#EC4899", "#8B5CF6"],
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function BrandCover({ brandName, brandLogoUrl, coverUrl, height = 168, children }: Props) {
  const [c1, c2] = brandColors(brandName);
  const initial = (brandName?.[0] ?? "C").toUpperCase();
  return (
    <div
      className="brand-cover w-full"
      style={{
        height,
        background: coverUrl
          ? `url(${coverUrl}) center/cover`
          : `linear-gradient(135deg, ${c2} 0%, ${c1} 100%)`,
      }}
    >
      {!coverUrl && (
        <div
          aria-hidden
          className="absolute font-black select-none"
          style={{
            right: -16, bottom: -32,
            fontSize: Math.round(height * 1.05),
            lineHeight: 1, color: "rgba(255,255,255,0.18)",
            letterSpacing: "-0.04em",
          }}
        >
          {initial}
        </div>
      )}
      {brandLogoUrl && !coverUrl && (
        <img src={brandLogoUrl} alt={brandName}
          className="absolute top-3 left-3 h-9 w-9 rounded-lg bg-white object-contain p-1 shadow"
        />
      )}
      <div className="relative h-full">{children}</div>
    </div>
  );
}
