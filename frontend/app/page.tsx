import Link from "next/link"
import { Upload, FileText, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthGuard } from "@/components/auth-guard"

export default function HomePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-foreground mb-4">Health Report Manager</h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Upload, organize, and analyze your health documents with intelligent insights
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            <Card className="border border-border hover:border-border/80 transition-colors">
              <CardHeader className="text-center pb-4">
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-blue-600 dark:text-blue-400 mb-3" />
                <CardTitle className="text-lg font-medium">Upload Reports</CardTitle>
                <CardDescription className="text-sm">Upload your health documents</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/upload">
                  <Button className="w-full" size="sm">
                    Upload
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-border/80 transition-colors">
              <CardHeader className="text-center pb-4">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-green-600 dark:text-green-400 mb-3" />
                <CardTitle className="text-lg font-medium">View Reports</CardTitle>
                <CardDescription className="text-sm">Browse your uploaded reports</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/reports">
                  <Button variant="outline" className="w-full" size="sm">
                    View Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-border/80 transition-colors sm:col-span-2 lg:col-span-1">
              <CardHeader className="text-center pb-4">
                <Activity className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-purple-600 dark:text-purple-400 mb-3" />
                <CardTitle className="text-lg font-medium">Analyze</CardTitle>
                <CardDescription className="text-sm">Get detailed parameter insights</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/reports">
                  <Button variant="secondary" className="w-full" size="sm">
                    Analyze
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
