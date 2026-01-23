'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-100 group-[.toaster]:shadow-premium group-[.toaster]:rounded-[2rem] group-[.toaster]:p-6 group-[.toaster]:font-black group-[.toaster]:uppercase group-[.toaster]:tracking-widest group-[.toaster]:italic",
          description: "group-[.toast]:text-slate-500 group-[.toast]:font-medium group-[.toast]:not-italic group-[.toast]:normal-case group-[.toast]:tracking-normal group-[.toast]:text-xs",
          actionButton: "group-[.toast]:bg-pink-600 group-[.toast]:text-white group-[.toast]:rounded-xl group-[.toast]:font-black group-[.toast]:uppercase group-[.toast]:tracking-widest group-[.toast]:italic group-[.toast]:px-4 group-[.toast]:h-10",
          cancelButton: "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500 group-[.toast]:rounded-xl group-[.toast]:font-black group-[.toast]:uppercase group-[.toast]:tracking-widest group-[.toast]:italic group-[.toast]:px-4 group-[.toast]:h-10",
          success: "group-[.toaster]:bg-white/90 group-[.toaster]:border-emerald-100 group-[.toaster]:text-emerald-950",
          error: "group-[.toaster]:bg-rose-50/90 group-[.toaster]:border-rose-100 group-[.toaster]:text-rose-950",
          info: "group-[.toaster]:bg-blue-50/90 group-[.toaster]:border-blue-100 group-[.toaster]:text-blue-950",
          warning: "group-[.toaster]:bg-amber-50/90 group-[.toaster]:border-amber-100 group-[.toaster]:text-amber-950",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
