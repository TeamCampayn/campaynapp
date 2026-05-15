import logoSrc from "@/assets/campayn-logo.png";

export function Logo({
  className = "",
  invert = false,
  size = 32,
  showWordmark = true,
}: {
  className?: string;
  invert?: boolean;
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={logoSrc}
        alt="Campayn"
        width={size}
        height={size}
        className="rounded-full object-cover bg-white shadow-[0_4px_14px_rgba(60,76,226,0.18)]"
        style={{ width: size, height: size }}
      />
      {showWordmark && (
        <span
          className={`font-extrabold tracking-tight text-lg ${invert ? "text-white" : "text-foreground"}`}
        >
          campayn
        </span>
      )}
    </div>
  );
}
