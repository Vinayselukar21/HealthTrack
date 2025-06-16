"use client"

import type React from "react"

import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, FileText, ImageIcon, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function UploadPage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [reportTitle, setReportTitle] = useState("")
  const [reportNotes, setReportNotes] = useState("")
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadPDF = async (file: File) => {
    const formData = new FormData();
    formData.append('userId', user?.id!)
    formData.append('title', reportTitle);
    formData.append('notes', reportNotes);
    formData.append('file', file); // 'pdf' is the key expected by the backend

    try {
      const response = await fetch('http://localhost:8000/extract', {
        method: 'POST',
        body: formData,
        // ⚠️ Don't set Content-Type manually when using FormData — browser sets it with correct boundary
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('Success:', data);
      return data
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpload = async () => {
    uploadPDF(files[0]).then((data) => {
      console.log(data, "returned data from api")
    })
    // FileUploader(user ? user.id : "", files[0])   // to upload file in supabase
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            router.push("/reports")
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 dark:text-red-400" />
    }
    return <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400" />
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Upload Health Reports</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Upload your blood reports, lab results, or health documents
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">Report Details</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Add information about your health report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-4 sm:px-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm sm:text-base">
                    Report Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Blood Test - January 2024"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm sm:text-base">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes about this report..."
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    className="min-h-[80px] sm:min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-sm sm:text-base">Upload Files</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center hover:border-border/80 transition-colors">
                    <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <p className="text-base sm:text-lg font-medium">Drop files here or click to browse</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Supports PDF, JPG, PNG files up to 10MB
                      </p>
                    </div>
                    <Input
                      type="file"
                      // multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="mt-4 h-10 sm:h-11"
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base">Selected Files ({files.length})</Label>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              {getFileIcon(file)}
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm sm:text-base truncate">{file.name}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button
                      onClick={handleUpload}
                      disabled={files.length === 0 || uploading}
                      className="flex-1 h-10 sm:h-11"
                    >
                      {uploading ? "Uploading..." : "Upload Reports"}
                    </Button>
                    <Link href="/reports" className="flex-1 sm:flex-none">
                      <Button variant="outline" className="w-full h-10 sm:h-11">
                        View Reports
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
