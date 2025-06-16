"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  FileText,
  Filter,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Info,
  Lightbulb,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthGuard } from "@/components/auth-guard"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import useGetReportById, { TestParameter } from "@/lib/api-hooks/useGetReportById"

// Mock data for detailed report
const mockReportDetail = {
  id: 1,
  title: "Complete Blood Count - January 2024",
  date: "2024-01-15",
  type: "Blood Test",
  lab: "City Medical Lab",
  doctor: "Dr. Sarah Johnson",
  parameters: [
    {
      name: "Hemoglobin",
      value: 15.2,
      unit: "g/dL",
      normalRange: "12.0-16.0",
      status: "normal",
      category: "Red Blood Cells",
      description: "Hemoglobin is a protein in red blood cells that carries oxygen throughout your body.",
      recommendations: [
        "Maintain a balanced diet rich in iron",
        "Include vitamin C to enhance iron absorption",
        "Regular exercise to improve circulation",
      ],
      historicalData: [
        { date: "Aug 2023", value: 14.8 },
        { date: "Oct 2023", value: 15.0 },
        { date: "Dec 2023", value: 15.1 },
        { date: "Jan 2024", value: 15.2 },
      ],
    },
    {
      name: "White Blood Cell Count",
      value: 11.5,
      unit: "×10³/μL",
      normalRange: "4.0-10.0",
      status: "high",
      category: "White Blood Cells",
      description: "White blood cells help fight infections and diseases in your body.",
      recommendations: [
        "Consult your doctor about possible infections",
        "Get adequate rest and sleep",
        "Manage stress levels",
        "Avoid smoking and excessive alcohol",
      ],
      historicalData: [
        { date: "Aug 2023", value: 8.2 },
        { date: "Oct 2023", value: 9.1 },
        { date: "Dec 2023", value: 10.8 },
        { date: "Jan 2024", value: 11.5 },
      ],
    },
    {
      name: "Platelet Count",
      value: 180,
      unit: "×10³/μL",
      normalRange: "150-400",
      status: "normal",
      category: "Platelets",
      description: "Platelets help your blood clot and prevent excessive bleeding.",
      recommendations: ["Maintain current healthy lifestyle", "Regular monitoring as recommended", "Stay hydrated"],
      historicalData: [
        { date: "Aug 2023", value: 175 },
        { date: "Oct 2023", value: 182 },
        { date: "Dec 2023", value: 178 },
        { date: "Jan 2024", value: 180 },
      ],
    },
    {
      name: "Mean Corpuscular Volume",
      value: 78,
      unit: "fL",
      normalRange: "80-100",
      status: "low",
      category: "Red Blood Cells",
      description: "MCV measures the average size of your red blood cells.",
      recommendations: [
        "Increase iron-rich foods in your diet",
        "Consider iron supplements (consult doctor)",
        "Include folate and B12 rich foods",
        "Follow up with healthcare provider",
      ],
      historicalData: [
        { date: "Aug 2023", value: 82 },
        { date: "Oct 2023", value: 80 },
        { date: "Dec 2023", value: 79 },
        { date: "Jan 2024", value: 78 },
      ],
    },
  ],
}

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: reportId } = React.use(params); // unwraps the promise using React.use
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedParameter, setSelectedParameter] = useState<TestParameter>()

  const {reportData, reportLoading} = useGetReportById(reportId)
  console.log(reportData)

  const filteredParameters = reportData?.tests.filter((param: any) => {
    // const matchesStatus = filterStatus === "all" || param.status === filterStatus
    // const matchesCategory = selectedCategory === "all" || param.category === selectedCategory
    // return matchesStatus && matchesCategory
    return true
  }) || []
  
  
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "high":
        return <TrendingUp className="w-4 h-4 text-red-500 dark:text-red-400" />
      case "low":
        return <TrendingDown className="w-4 h-4 text-blue-500 dark:text-blue-400" />
      default:
        return <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            High
          </Badge>
        )
      case "low":
        return (
          <Badge variant="secondary" className="text-xs">
            Low
          </Badge>
        )
      default:
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">Normal</Badge>
        )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "high":
        return "border-l-red-500 bg-red-50 dark:bg-red-950"
      case "low":
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-950"
      default:
        return "border-l-green-500 bg-green-50 dark:bg-green-950"
    }
  }

  const categories = ["all", ...Array.from(new Set(mockReportDetail.parameters.map((p) => p.category)))]
  const statusCounts = {
    high: mockReportDetail.parameters.filter((p) => p.status === "high").length,
    normal: mockReportDetail.parameters.filter((p) => p.status === "normal").length,
    low: mockReportDetail.parameters.filter((p) => p.status === "low").length,
  }
  
  console.log(selectedParameter)

  return (
    <AuthGuard>
      {reportLoading ? "Loading.." :<div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link
              href="/reports"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Link>

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-light text-foreground mb-2 leading-tight">
                  {reportData?.report_name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    {new Date(reportData?.report_metadata?.report_date || "").toLocaleDateString()}
                  </div>
                  {/* <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    {mockReportDetail.type}
                  </div>
                  <div className="hidden sm:block">Lab: {mockReportDetail.lab}</div> */}
                  <div className="hidden sm:block">Doctors: {reportData?.report_metadata?.doctor_name}</div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md">
                <div className="text-center p-2 sm:p-3 bg-red-50 dark:bg-red-950 rounded-lg border">
                  <div className="text-lg sm:text-xl font-semibold text-red-600 dark:text-red-400">
                    {statusCounts.high}
                  </div>
                  <div className="text-xs text-red-500 dark:text-red-400">High</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-950 rounded-lg border">
                  <div className="text-lg sm:text-xl font-semibold text-green-600 dark:text-green-400">
                    {statusCounts.normal}
                  </div>
                  <div className="text-xs text-green-500 dark:text-green-400">Normal</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border">
                  <div className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400">
                    {statusCounts.low}
                  </div>
                  <div className="text-xs text-blue-500 dark:text-blue-400">Low</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Side - Parameters List */}
            <div className="lg:col-span-5">
              {/* Filters */}
              <Card className="mb-4 sm:mb-6 border border-border">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium mb-2 block">Status</label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-medium mb-2 block">Category</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category === "all" ? "All" : category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parameters List */}
              <div className="space-y-2 sm:space-y-3">
                {filteredParameters.map((parameter, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all border-l-4 ${getStatusColor(parameter.status)} ${
                      selectedParameter?.parameter_tag === parameter.parameter_tag ? "ring-2 ring-blue-200 dark:ring-blue-800" : ""
                    }`}
                    onClick={() => setSelectedParameter(parameter)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <h3 className="font-medium text-sm sm:text-base truncate">{parameter.parameter_name}</h3>
                          {getStatusIcon(parameter.status)}
                        </div>
                        {getStatusBadge(parameter.status)}
                      </div>
                      <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
                        <span className="truncate text-xs">{parameter.parameter_tag}</span>
                        <span className="font-semibold ml-2">
                          {parameter.value} {parameter.unit}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Side - Parameter Details */}
            <div className="lg:col-span-7">
              <div className="space-y-4 sm:space-y-6">
                {/* Parameter Trend Chart */}
                <Card className="border border-border">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <span className="truncate">{selectedParameter?.parameter_name} Trend</span>
                      {getStatusIcon(selectedParameter?.status || "")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="h-48 sm:h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedParameter?.historicalData || []}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
                          <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "6px",
                              fontSize: "12px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Current Value:</span>
                        <span className="font-semibold">
                          {selectedParameter?.value} {selectedParameter?.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm mt-1">
                        <span>Normal Range:</span>
                        <span>
                          {selectedParameter?.reference_range?.range_text} {selectedParameter?.unit}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parameter Information */}
                <Card className="border border-border">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="truncate">About {selectedParameter?.parameter_name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      Description: {selectedParameter?.parameter_tag}
                    </p>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="border border-border">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="space-y-3">
                      {/* {selectedParameter.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm sm:text-base text-muted-foreground">{recommendation}</p>
                        </div>
                      ))} */}
                    </div>
                    {selectedParameter?.status !== "normal" && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>Note:</strong> Please consult with your healthcare provider for personalized advice
                          and treatment options.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>}
    </AuthGuard>
  )
}
