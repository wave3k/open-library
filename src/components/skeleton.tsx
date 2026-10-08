export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`ol-skeleton rounded-lg ${className}`} aria-hidden="true" />
}

/** Carte de livre en chargement (même gabarit que les vraies cartes). */
export function BookCardSkeleton() {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-2xl border p-4">
      <div className="flex justify-center pt-1">
          <Skeleton className="h-[196px] w-[132px] rounded-none" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

/** Grille de cartes en chargement. */
export function BookGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => <BookCardSkeleton key={i} />)}
    </div>
  )
}

/** En-tête de profil en chargement. */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-card overflow-hidden rounded-3xl border">
        <Skeleton className="h-40 w-full rounded-none sm:h-52" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-2 pb-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-card flex gap-4 rounded-2xl border p-4">
              <Skeleton className="h-[196px] w-[132px] rounded-none" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
