"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !error && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, error, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return null // Error is handled by AuthProvider
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
