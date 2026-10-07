/** Champ de formulaire accessible : label, compteur, aide, erreur. */
export default function Field({ id, label, hint, error, count, max, children }) {
  const over = typeof max === 'number' && typeof count === 'number' && count > max
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold tracking-wide text-stone-500">
          {label}
        </label>
        {typeof count === 'number' && typeof max === 'number' && (
          <span className={`text-[11px] tabular-nums ${over ? 'font-semibold text-red-600' : 'text-stone-400'}`}>
            {count}/{max}
          </span>
        )}
      </div>
      <div className="mt-1">{children}</div>
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-stone-400">{hint}</p>
      ) : null}
    </div>
  )
}
