
export default function TestPage() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Diagnostic Page</h1>
      <p>If you can see this, localized routing and layout are working.</p>
      <div className="mt-4 p-4 bg-slate-100 rounded">
        <h2 className="font-bold">Environment Check:</h2>
        <pre className="mt-2 text-xs">
          {JSON.stringify({
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
            HAS_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            HAS_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
