
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Calendar, Trophy, Zap } from "lucide-react"

interface PublicMilestonePageProps {
  params: Promise<{
    token: string
    locale: string
  }>
}

export default async function PublicMilestonePage({ params }: PublicMilestonePageProps) {
  const { token, locale } = await params

  const supabase = await createClient()

  // Fetch shared milestone
  const { data: milestone, error } = await supabase
    .from('progress_milestones')
    .select(`
      *,
      center:centers!center_id (
        id,
        name,
        logo_url,
        brand_color
      ),
      customer:users!customer_id (
        id,
        full_name
      )
    `)
    .eq('share_token', token)
    .eq('is_shared', true)
    .single()

  if (error || !milestone) {
    console.error('[PublicMilestonePage] Error:', error)
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center py-20 px-6">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
        </div>

        <div className="max-w-4xl w-full space-y-12 relative z-10 text-center">
          <div className="space-y-4">
            <Badge variant="outline" className="px-4 py-1 rounded-full border-blue-500/30 text-blue-400 bg-blue-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl">
              <ShieldCheck className="mr-2 h-3.5 w-3.5 animate-pulse" />
              Verified Aesthetic Achievement
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter italic">
              Biological_Evolution<br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent not-italic uppercase tracking-[0.1em]">Synchronized</span>
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
            {/* The Actual Shareable Card - Rendered publicly */}
            <div className="shrink-0 scale-90 md:scale-100 origin-center">
              <div className="w-[400px] h-[600px] bg-slate-900/50 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl ring-1 ring-white/20">
                <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-600/10 rounded-full blur-[80px]" />
                
                <div className="relative z-10 space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/10 border border-white/20">
                      <Trophy className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Verified_Node</span>
                  </div>
                  <h2 className="text-3xl font-black italic leading-[0.9] tracking-tighter">
                    {milestone.title.toUpperCase()}
                  </h2>
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-center space-y-8">
                  <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto shadow-2xl">
                    <Trophy className="h-12 w-12 text-white" />
                  </div>
                  <div className="text-center space-y-3 px-4">
                    <p className="text-sm text-slate-300 italic leading-relaxed">
                      "{milestone.description}"
                    </p>
                  </div>
                </div>

                <div className="relative z-10 pt-8 border-t border-white/10 space-y-6 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Node_Explorer</p>
                      <p className="text-sm font-bold italic">{milestone.customer?.full_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Center_Origin</p>
                      <p className="text-sm font-bold italic">{milestone.center?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-blue-500" />
                    <p className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-600">Sync Date: {new Date(milestone.achieved_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Context Info */}
            <div className="flex-1 text-left space-y-8 max-w-md">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold italic text-blue-400">About this Achievement</h3>
                <p className="text-slate-400 font-light leading-relaxed">
                  This biological milestone was achieved through precision aesthetic protocols and consistent skin node synchronization. Verified by the CenterIQ AI engine.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <Calendar className="h-5 w-5 text-blue-400 mb-3" />
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Achieved_On</p>
                  <p className="text-sm font-bold italic">{new Date(milestone.achieved_at).toLocaleDateString()}</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <Zap className="h-5 w-5 text-pink-400 mb-3" />
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Status</p>
                  <p className="text-sm font-bold italic">AUTHENTIC</p>
                </div>
              </div>

              <div className="pt-6">
                <p className="text-xs text-slate-500 italic mb-6">Want to begin your own aesthetic journey with AI Precision?</p>
                <button className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-600/20 transition-all">
                  Initialize Your Node
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export async function generateMetadata({ params }: PublicMilestonePageProps) {
  const { token } = await params
  const supabase = await createClient()

  const { data: milestone } = await supabase
    .from('progress_milestones')
    .select('title, center:centers!center_id(name), customer:users!customer_id(full_name)')
    .eq('share_token', token)
    .single()

  const centerRecord = milestone?.center as any
  const centerName = centerRecord?.name || 'Center'
  const customerName = (milestone?.customer as any)?.full_name

  return {
    title: `${customerName || 'Explorer'}'s Aesthetic Achievement - CenterIQ`,
    description: `View achievement: ${milestone?.title}`,
    robots: 'noindex, nofollow'
  }
}
