export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-[2rem] border border-slate-800 bg-slate-950/95 shadow-2xl shadow-slate-950/20 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
