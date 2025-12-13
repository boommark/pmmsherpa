'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle, XCircle, Copy, Mail, User, Building, Briefcase, Link as LinkIcon, Calendar, ListChecks } from 'lucide-react'
import { toast } from 'sonner'

interface AccessRequest {
  id: string
  fullName: string
  email: string
  phone?: string
  profession?: string
  company?: string
  linkedinUrl?: string
  useCases: string[]
  createdAt: string
}

interface ApprovalResult {
  success: boolean
  message: string
  user: {
    id: string
    email: string
    fullName: string
  }
  passwordResetLink?: string
  welcomeEmailDraft: {
    subject: string
    body: string
  }
}

function AdminApproveContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [request, setRequest] = useState<AccessRequest | null>(null)
  const [approvalResult, setApprovalResult] = useState<ApprovalResult | null>(null)

  useEffect(() => {
    if (!token) {
      setError('No approval token provided')
      setLoading(false)
      return
    }

    const fetchRequest = async () => {
      try {
        const response = await fetch(`/api/access-request/approve?token=${token}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to fetch request')
          return
        }

        setRequest(data)
      } catch (err) {
        setError('Failed to load request details')
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [token])

  const handleApprove = async () => {
    if (!token) return

    setApproving(true)
    try {
      const response = await fetch('/api/access-request/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to approve request')
        return
      }

      setApprovalResult(data)
      toast.success('User approved successfully!')
    } catch (err) {
      toast.error('Failed to approve request')
    } finally {
      setApproving(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/admin/requests')} variant="outline">
              View All Requests
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (approvalResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Approval Successful!</CardTitle>
              <CardDescription>
                {approvalResult.user.fullName} has been approved and their account has been created.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">User Details:</p>
                <p className="text-sm text-muted-foreground">Name: {approvalResult.user.fullName}</p>
                <p className="text-sm text-muted-foreground">Email: {approvalResult.user.email}</p>
              </div>

              {approvalResult.passwordResetLink && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                    Password Reset Link (backup)
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 break-all">
                    {approvalResult.passwordResetLink}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => copyToClipboard(approvalResult.passwordResetLink!, 'Reset link')}
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Copy Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Welcome Email Draft
              </CardTitle>
              <CardDescription>
                Copy this and send manually via Gmail to give a personal touch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject:</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-sm bg-muted px-3 py-2 rounded">
                    {approvalResult.welcomeEmailDraft.subject}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(approvalResult.welcomeEmailDraft.subject, 'Subject')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Body:</label>
                <div className="relative mt-1">
                  <Textarea
                    readOnly
                    value={approvalResult.welcomeEmailDraft.body}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(approvalResult.welcomeEmailDraft.body, 'Email body')}
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const subject = encodeURIComponent(approvalResult.welcomeEmailDraft.subject)
                    const body = encodeURIComponent(approvalResult.welcomeEmailDraft.body)
                    window.open(`mailto:${approvalResult.user.email}?subject=${subject}&body=${body}`)
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Open in Email Client
                </Button>
                <Button variant="outline" onClick={() => router.push('/admin/requests')}>
                  View All Requests
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 py-8">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Approve Access Request</CardTitle>
            <CardDescription>
              Review the details below and approve to create the user account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {request && (
              <>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-muted-foreground">{request.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{request.email}</p>
                    </div>
                  </div>

                  {request.phone && (
                    <div className="flex items-start gap-3">
                      <span className="text-muted-foreground">📱</span>
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{request.phone}</p>
                      </div>
                    </div>
                  )}

                  {request.profession && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Profession</p>
                        <p className="text-sm text-muted-foreground">{request.profession}</p>
                      </div>
                    </div>
                  )}

                  {request.company && (
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Company</p>
                        <p className="text-sm text-muted-foreground">{request.company}</p>
                      </div>
                    </div>
                  )}

                  {request.linkedinUrl && (
                    <div className="flex items-start gap-3">
                      <LinkIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">LinkedIn</p>
                        <a
                          href={request.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {request.linkedinUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <ListChecks className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Use Cases</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {request.useCases.map((useCase, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {useCase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Requested</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex-1"
                  >
                    {approving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Access
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/requests')}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminApprovePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AdminApproveContent />
    </Suspense>
  )
}
