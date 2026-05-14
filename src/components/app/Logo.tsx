export function Logo({ className = "", invert = false }: { className?: string; invert?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className="h-8 w-8 rounded-xl grad-primary grid place-items-center font-black shadow-md text-white"
        style={{ fontSize: 16 }}
      >
        C
      </div>
      <span
        className={`font-extrabold tracking-tight text-lg ${invert ? "text-white" : "text-foreground"}`}
      >
        campayn
      </span>
    </div>
  );
}
