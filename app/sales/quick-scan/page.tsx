export default function QuickScanPage() {
  return (
    <div>
      <h1>Quick Scan</h1>
      <p>Redirecting to Thai version...</p>
      <script dangerouslySetInnerHTML={{
        __html: 'window.location.href = "/th/sales/quick-scan"'
      }} />
    </div>
  )
}
