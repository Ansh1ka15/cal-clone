export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-[var(--primary)] text-[var(--primary-text)] hover:bg-[var(--primary-hover)] focus-visible:ring-[var(--primary)]/40",
    secondary:
      "bg-[var(--panel-bg)] text-[var(--text)] hover:bg-[var(--hover)] focus-visible:ring-[var(--panel-border)]/40",
    outline:
      "border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text)] hover:bg-[var(--hover)] focus-visible:ring-[var(--panel-border)]/40",
    ghost:
      "bg-transparent text-[var(--muted)] hover:bg-[var(--hover)] focus-visible:ring-[var(--panel-border)]/40",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40",
  };
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-sm",
    lg: "px-5 py-3 text-base",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
