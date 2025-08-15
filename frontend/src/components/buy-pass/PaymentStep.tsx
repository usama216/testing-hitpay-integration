// src/components/buy-pass/PaymentStep.tsx
'use client'

import { useState } from 'react'
import { CreditCard, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type Props = {
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'card' | 'paynow'
  onPaymentMethodChange: (v: 'card' | 'paynow') => void
  customer: { name: string; email: string; phone: string }
  order: {
    packageName: string
    quantity: number
    notes?: string
  }
  onBack: () => void
  onComplete: () => void
}

export default function PaymentStep({
  subtotal,
  tax,
  total,
  paymentMethod,
  onPaymentMethodChange,
  customer,
  order,
  onBack,
  onComplete,
}: Props) {
  const [loading, setLoading] = useState(false)

  // TODO: integrate HitPay here
  // Example:
  // const handlePay = async () => {
  //   setLoading(true)
  //   try {
  //     const res = await createHitPayCharge({
  //       amount: total,
  //       currency: 'SGD',
  //       customer,
  //       metadata: { packageName: order.packageName, quantity: order.quantity }
  //     })
  //     window.location.href = res.payment_url
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Payment</h3>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Select Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v: 'card' | 'paynow') => onPaymentMethodChange(v)}
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="card" id="card" />
              <label htmlFor="card" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  <span>Credit/Debit Card</span>
                </div>
              </label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg mt-3">
              <RadioGroupItem value="paynow" id="paynow" />
              <label htmlFor="paynow" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  <span>PayNow</span>
                </div>
              </label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order & Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-gray-700">
            <div><b>Package:</b> {order.packageName}</div>
            <div><b>Quantity:</b> {order.quantity}</div>
          </div>
          <div className="text-sm text-gray-700">
            <div><b>Payer:</b> {customer.name}</div>
            <div><b>Email:</b> {customer.email}</div>
            <div><b>Phone:</b> {customer.phone}</div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>GST (9%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={loading} className="flex-1">
          Back
        </Button>
        <Button
          onClick={() => {
            setLoading(true)
            setTimeout(() => {
              setLoading(false)
              onComplete()
            }, 800) // demo only
          }}
          disabled={loading}
          className="flex-1 bg-orange-500 hover:bg-orange-600"
        >
          {loading ? 'Processing…' : 'Pay (Demo)'}
        </Button>
      </div>
    </div>
  )
}
