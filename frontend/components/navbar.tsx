"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Activity, LogOut, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "./auth-provider"
import { ThemeToggle } from "./theme-toggle"
import { useState } from "react"

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  if (!user) return null

  const NavLinks = ({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) => (
    <>
      <Link href="/reports" onClick={onClose}>
        <Button variant="ghost" className={mobile ? "w-full justify-start" : ""}>
          Reports
        </Button>
      </Link>
      <Link href="/upload" onClick={onClose}>
        <Button variant="ghost" className={mobile ? "w-full justify-start" : ""}>
          Upload
        </Button>
      </Link>
    </>
  )

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-semibold hidden sm:block">Health Reports</span>
            <span className="text-lg font-semibold sm:hidden">Health</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLinks />
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="hidden lg:block">
                    {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-2 pb-4 border-b">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0]}
                    </span>
                  </div>

                  <NavLinks mobile onClose={() => setIsOpen(false)} />

                  <div className="pt-4 border-t">
                    <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
