export default function Select({
  label,
  className = "",
  inputClassName = "",
  children,
  ...props
}) {
  return (
    <label className={`block text-sm font-medium text-slate-300 ${className}`}>
      {label}
      <select
        className={`mt-2 block w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${inputClassName}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
