import { useState } from "react";

type Props = { name: string; url?: string | null; size?: number; rounded?: "full" | "lg" | "xl"; className?: string };
const r = { full: "rounded-full", lg: "rounded-lg", xl: "rounded-xl" } as const;

export function BrandLogo({ name, url, size = 32, rounded = "full", className = "" }: Props) {
  const [errored, setErrored] = useState(false);
  const initial = (name?.[0] ?? "C").toUpperCase();
  const showImg = url && !errored;
  return (
    <span
      className={`${r[rounded]} grid place-items-center text-white font-bold overflow-hidden shrink-0 grad-primary ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.42) }}
      aria-label={name}
    >
      {showImg ? (
        <img
          src={url!}
          alt={name}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setErrored(true)}
          className={`h-full w-full object-cover bg-white ${url!.endsWith(".svg") || url!.includes("logo") ? "object-contain p-1" : ""}`}
        />
      ) : (
        <span>{initial}</span>
      )}
    </span>
  );
}
