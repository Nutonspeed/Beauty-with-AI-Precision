export function VideoHeroSkeleton() {
  return (
    <div className="relative min-h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 animate-pulse">
          <div className="h-full w-full bg-gradient-to-br from-slate-800/50 via-blue-800/50 to-purple-800/50" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <div className="w-32 h-8 bg-white/10 rounded-full animate-pulse mb-8" />
          <div className="space-y-4 w-full max-w-3xl">
            <div className="h-16 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-12 bg-white/10 rounded-lg animate-pulse w-3/4 mx-auto" />
            <div className="h-8 bg-white/10 rounded-lg animate-pulse w-1/2 mx-auto" />
          </div>
          <div className="flex gap-4 mt-10">
            <div className="w-40 h-14 bg-white/10 rounded-xl animate-pulse" />
            <div className="w-40 h-14 bg-white/10 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
