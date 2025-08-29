"use client"

import { Button } from "@/components/ui/button"

type PaymentMethod = "card" | "local-bank-transfer" | "bank-transfer" | "churchpad"
type SupportOption = "support" | "report" | "updates" | "transactions"

interface PaymentButtonsProps {
  selectedPayment: PaymentMethod
  selectedSupport: SupportOption | null
  onPaymentClick: (method: PaymentMethod) => void
  onSupportClick: (option: SupportOption) => void
}

interface PaymentOption {
  id: PaymentMethod
  label: string
}

interface PaymentSection {
  title: string
  options: PaymentOption[]
}

const paymentSections: PaymentSection[] = [
  {
    title: "LOCAL OPTIONS",
    options: [
      { id: "card", label: "CARD PAYMENT" },
      { id: "local-bank-transfer", label: "BANK TRANSFER" },
    ],
  },
  {
    title: "INTERNATIONAL OPTIONS",
    options: [
      { id: "churchpad", label: "PAYAZA (INTERNATIONAL USERS)" },
      { id: "bank-transfer", label: "BANK TRANSFER" },
    ],
  },
]

export default function PaymentButtons({
  selectedPayment,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedSupport,
  onPaymentClick,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSupportClick,
}: PaymentButtonsProps) {
  return (
    <div className="space-y-6">
      {paymentSections.map((section) => (
        <div key={section.title} className="py-2">
          <h4 className="text-white text-sm font-semibold mb-3">{section.title}</h4>
          <div className="flex flex-wrap gap-4">
            {section.options.map((option) => (
              <Button
                key={option.id}
                onClick={() => onPaymentClick(option.id)}
                variant={selectedPayment === option.id ? "default" : "outline"}
                className={`px-6 py-3 border-1 text-[10px] border-white hover:scale-105 transition-all duration-200 rounded-[20px] w-[200px] ${
                  selectedPayment === option.id 
                    ? "bg-white text-black hover:bg-gray-100" 
                    : "bg-transparent text-white"
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
