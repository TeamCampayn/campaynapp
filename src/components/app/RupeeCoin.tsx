// Indigo ₹ token - replaces every yellow dot in the app.
type Props = { size?: number; className?: string };
export function RupeeCoin({ size = 18, className = "" }: Props) {
  const id = `rc-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#7586F5" />
          <stop offset="60%" stopColor="#3C4CE2" />
          <stop offset="100%" stopColor="#1E2A9E" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={`url(#${id})`} />
      <circle cx="12" cy="12" r="11" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
      <text x="12" y="16.4" textAnchor="middle" fontFamily="ui-sans-serif,system-ui,Inter,sans-serif"
        fontWeight="900" fontSize="13" fill="#fff" style={{ letterSpacing: "-0.02em" }}>₹</text>
    </svg>
  );
}

// Compact INR formatter that pairs with the coin (no leading ₹ - the coin IS the ₹).
export const compactInr = (n: number) => {
  if (n >= 10000000) return (n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 1).replace(/\.0$/, "") + "Cr";
  if (n >= 100000)  return (n / 100000).toFixed(n % 100000 === 0 ? 0 : 1).replace(/\.0$/, "") + "L";
  if (n >= 1000)    return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(/\.0$/, "") + "K";
  return n.toLocaleString("en-IN");
};
