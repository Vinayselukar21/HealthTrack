"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, FileText, Filter, Search, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthGuard } from "@/components/auth-guard"
import axios from "axios"
import { useAuth } from "@/components/auth-provider"
import useGetAllReports from "@/lib/api-hooks/useGetAllReports"

// Mock data for reports
const mockReports = [
  {
    id: 1,
    title: "Complete Blood Count - January 2024",
    date: "2024-01-15",
    type: "Blood Test",
    status: "high",
    highCount: 3,
    lowCount: 1,
    normalCount: 8,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Lipid Profile - December 2023",
    date: "2023-12-20",
    type: "Blood Test",
    status: "normal",
    highCount: 0,
    lowCount: 0,
    normalCount: 6,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Liver Function Test - November 2023",
    date: "2023-11-10",
    type: "Blood Test",
    status: "low",
    highCount: 0,
    lowCount: 2,
    normalCount: 5,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    title: "Thyroid Function - October 2023",
    date: "2023-10-25",
    type: "Blood Test",
    status: "high",
    highCount: 2,
    lowCount: 0,
    normalCount: 4,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    title: "Diabetes Panel - September 2023",
    date: "2023-09-15",
    type: "Blood Test",
    status: "normal",
    highCount: 0,
    lowCount: 0,
    normalCount: 3,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 6,
    title: "Kidney Function - August 2023",
    date: "2023-08-30",
    type: "Blood Test",
    status: "low",
    highCount: 0,
    lowCount: 1,
    normalCount: 4,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
]

export default function ReportsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || report.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "high":
        return <TrendingUp className="w-4 h-4 text-red-500 dark:text-red-400" />
      case "low":
        return <TrendingDown className="w-4 h-4 text-blue-500 dark:text-blue-400" />
      default:
        return <Minus className="w-4 h-4 text-green-500 dark:text-green-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            High Values
          </Badge>
        )
      case "low":
        return (
          <Badge variant="secondary" className="text-xs">
            Low Values
          </Badge>
        )
      default:
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs"
          >
            Normal
          </Badge>
        )
    }
  }

  const {reportsData, reportsLoading} = useGetAllReports(user?.id!)
  const data = reportsData || []
console.log(reportsData, "reports data", user)
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-light text-foreground mb-2">Health Reports</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Manage and analyze your health reports</p>
              </div>
              <Link href="/upload">
                <Button size="sm" className="w-full sm:w-auto">
                  Upload Report
                </Button>
              </Link>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col gap-3 sm:gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 sm:h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-10 sm:h-11 sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="high">High Values</SelectItem>
                    <SelectItem value="normal">Normal Values</SelectItem>
                    <SelectItem value="low">Low Values</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10 sm:h-11 sm:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {reportsLoading ? "Loading..." :data && data.map((report: any) => (
              <Link key={report._id} href={`/reports/${report._id}`}>
                <Card className="hover:shadow-lg dark:hover:shadow-2xl transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                      {getStatusIcon(report.status)}
                    </div>
                    <CardTitle className="text-base sm:text-lg line-clamp-2 leading-tight">{report?.report_name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      {new Date(report.report_metadata.report_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {getStatusBadge(report.status)}

                      <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
                        <div className="text-center p-1.5 sm:p-2 bg-red-50 dark:bg-red-950 rounded">
                          <div className="font-semibold text-red-600 dark:text-red-400">{report.highCount}</div>
                          <div className="text-red-500 dark:text-red-400">High</div>
                        </div>
                        <div className="text-center p-1.5 sm:p-2 bg-green-50 dark:bg-green-950 rounded">
                          <div className="font-semibold text-green-600 dark:text-green-400">{report.normalCount}</div>
                          <div className="text-green-500 dark:text-green-400">Normal</div>
                        </div>
                        <div className="text-center p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-950 rounded">
                          <div className="font-semibold text-blue-600 dark:text-blue-400">{report.lowCount}</div>
                          <div className="text-blue-500 dark:text-blue-400">Low</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No reports found</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 px-4">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload your first health report to get started"}
              </p>
              <Link href="/upload">
                <Button>Upload Report</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
