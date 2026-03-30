export default function Input({
  label,
  type = "text",
  className = "",
  inputClassName = "",
  error,
  ...props
}) {
  return (
    <label className={`block text-sm font-medium text-slate-300 ${className}`}>
      {label}
      <input
        type={type}
        className={`mt-2 block w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${inputClassName}`}
        {...props}
      />
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </label>
  );
}
