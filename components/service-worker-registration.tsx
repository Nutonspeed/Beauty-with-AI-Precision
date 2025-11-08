"use client"

import { useEffect } from "react"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // 🔧 DEVELOPMENT: Unregister old service workers and clear cache
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker?.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister()
          console.log("🧹 [DEV] Unregistered old Service Worker")
        })
      })
      
      caches?.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName)
          console.log(`🧹 [DEV] Deleted cache: ${cacheName}`)
        })
      })
      
      console.log("⏭️ Service Worker disabled in development mode")
      return
    }

    // Skip in preview/development to avoid MIME type errors
    const isProduction =
      process.env.NODE_ENV === "production" &&
      !window.location.hostname.includes("vusercontent.net") &&
      !window.location.hostname.includes("localhost")

    if (!isProduction || typeof globalThis.window === "undefined" || !("serviceWorker" in navigator)) {
      console.log("⏭️ Service Worker registration skipped (not production environment)")
      return
    }

    // Register Service Worker
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("✅ Service Worker registered:", registration)

        // Listen for updates
        registration.addEventListener("updatefound", () => handleUpdateFound(registration))
      })
      .catch((error) => {
        console.error("❌ Service Worker registration failed:", error)
      })

    // Handle Service Worker messages
    navigator.serviceWorker.addEventListener("message", handleMessage)

    // Cleanup
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage)
    }
  }, [])

  return null
}

function handleUpdateFound(registration: ServiceWorkerRegistration) {
  const newWorker = registration.installing
  if (newWorker) {
    newWorker.addEventListener("statechange", () => {
      if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
        console.log("🆕 New version available - please reload")
      }
    })
  }
}

function handleMessage(event: MessageEvent) {
  if (event.data && event.data.type === "CACHE_UPDATED") {
    console.log("📦 Cache updated:", event.data.url)
  }
}
