'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Database, CheckCircle, XCircle } from 'lucide-react'

export default function DatabaseSetup() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const setupDatabase = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/setup-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Setup failed')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/setup-db')
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              <CardTitle>Database Setup</CardTitle>
            </div>
            <CardDescription>
              Set up the required database tables for the JEE-NEET application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={checkStatus} disabled={loading} variant="outline">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Check Status
              </Button>
              <Button onClick={setupDatabase} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Setup Tables
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="space-y-4">
                <Alert variant={result.success ? "default" : "destructive"}>
                  {result.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>

                {result.tableStatus && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Table Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.tableStatus.map((table: any) => (
                          <div key={table.table} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-medium">{table.table}</span>
                            <div className="flex items-center gap-2">
                              {table.exists ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm">
                                {table.exists ? (table.accessible ? 'Ready' : 'Exists') : 'Missing'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {result.results && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Setup Results</CardTitle>
                      <CardDescription>
                        {result.summary?.successful || 0} successful, {result.summary?.failed || 0} failed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.results.map((item: any) => (
                          <div key={item.statement} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">
                              Statement {item.statement}: {item.description || 'SQL Statement'}
                            </span>
                            <div className="flex items-center gap-2">
                              {item.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              {item.error && (
                                <span className="text-xs text-red-600">{item.error}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}