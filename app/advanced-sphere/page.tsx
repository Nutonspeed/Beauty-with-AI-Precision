import dynamic from "next/dynamic"

const AdvancedSphere = dynamic(() => import("./AdvancedSphereScene"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      Loading 3D experience...
    </div>
  ),
})

export default function Page() {
  return <AdvancedSphere />
}
