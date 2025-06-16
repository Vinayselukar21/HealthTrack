"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Activity } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          router.push("/auth/login?error=configuration")
          return
        }

        const { supabase } = await import("@/lib/supabase/client")

        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          router.push("/auth/login?error=callback_error")
          return
        }

        if (data.session) {
          // User is authenticated, redirect to home
          router.push("/")
        } else {
          // No session found, redirect to login
          router.push("/auth/login")
        }
      } catch (err) {
        console.error("Callback handling error:", err)
        router.push("/auth/login?error=unexpected")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Completing sign in...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
