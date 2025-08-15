// src/app/buy-now/page.tsx
import { Suspense } from 'react'
import BuyPassClient from '@/app/buy-pass-tmp/BuyPassClient'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <BuyPassClient />
    </Suspense>
  )
}