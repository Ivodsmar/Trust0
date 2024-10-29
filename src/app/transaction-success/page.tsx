'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from 'lucide-react'

export default function TransactionSuccessPage() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-green-600">
            <CheckCircle className="inline-block mr-2 h-8 w-8" />
            Transaction Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">Your transaction has been processed successfully.</p>
          <Button onClick={() => router.push('/')} className="mr-2">
            Return to Home
          </Button>
          <Button onClick={() => router.push('/listings')} variant="outline">
            View Listings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}