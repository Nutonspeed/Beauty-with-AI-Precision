export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-96 bg-muted rounded" />
      </div>
    </div>
  )
}
