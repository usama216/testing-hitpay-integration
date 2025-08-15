'use client'

import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow p-10 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-gray-700 mb-6">
          Thank you for your purchase. Your transaction has been completed successfully.
        </p>
        <Link
          href="/pricing"
          className="inline-block px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
        >
          Back to Pricing
        </Link>
      </div>
    </div>
  )
}
