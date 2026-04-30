export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="h-8 w-8 rounded-xl grad-primary grid place-items-center font-black text-primary-foreground shadow-lg">C</div>
      <span className="font-black tracking-tight text-lg">campayn</span>
    </div>
  );
}
