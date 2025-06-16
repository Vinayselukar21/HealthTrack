"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => { },
  error: null,
})

const queryClient = new QueryClient()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError("Supabase configuration missing. Please set up environment variables.")
      setLoading(false)
      return
    }

    let subscription: any

    try {
      // Dynamically import supabase client to avoid initialization errors
      import("@/lib/supabase/client")
        .then(({ supabase }) => {
          // Get initial session
          supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
          })

          // Listen for auth changes
          const {
            data: { subscription: authSubscription },
          } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)

            // Handle OAuth sign-in completion
            if (event === "SIGNED_IN" && session) {
              // Create or update user profile for OAuth users
              const { user } = session
              if (user.app_metadata.provider === "google") {
                // Extract name from Google OAuth data
                const fullName = user.user_metadata.full_name || user.user_metadata.name

                // Update user metadata if needed
                if (fullName && !user.user_metadata.full_name) {
                  await supabase.auth.updateUser({
                    data: { full_name: fullName },
                  })
                }
              }
            }
          })

          subscription = authSubscription
        })
        .catch((err) => {
          setError("Failed to initialize Supabase client")
          setLoading(false)
        })
    } catch (err) {
      setError("Authentication system unavailable")
      setLoading(false)
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signOut = async () => {
    try {
      const { supabase } = await import("@/lib/supabase/client")
      await supabase.auth.signOut()
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  // If there's a configuration error, show a fallback
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Configuration Required</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="text-sm text-muted-foreground">
            <p>Please set up your Supabase environment variables:</p>
            <ul className="mt-2 text-left">
              <li>• NEXT_PUBLIC_SUPABASE_URL</li>
              <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, loading, signOut, error }}>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
