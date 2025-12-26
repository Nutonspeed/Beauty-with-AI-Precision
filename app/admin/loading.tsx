export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="text-center max-w-md w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading Admin Dashboard...</p>
        <div className="mt-4 flex flex-col gap-2">
          <a
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            href="/th/admin"
          >
            Go to /th/admin
          </a>
          <button
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  )
}
