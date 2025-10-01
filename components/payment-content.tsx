"use client"

import PaymentProviders from "./payment-providers"

type PaymentMethod = "card" | "local-bank-transfer" | "bank-transfer" | "churchpad"
type SupportOption = "support" | "report" | "updates"

interface PaymentContentProps {
  selectedPayment: PaymentMethod
  selectedSupport: SupportOption | null
}

export default function PaymentContent({ selectedPayment, selectedSupport }: PaymentContentProps) {
  if (selectedSupport) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">
          {selectedSupport === "support" && "Contact Support"}
          {selectedSupport === "report" && "Get Report"}
          {selectedSupport === "updates" && "Platform Updates"}
        </h3>
        <div className="text-gray-300">
          {selectedSupport === "support" && (
            <p>
              For technical support and assistance, please contact our support team at support@livingfaith.org or call
              +234-800-FAITH-1
            </p>
          )}
          {selectedSupport === "report" && (
            <p>
              Access your giver reports and transaction history. Reports are generated monthly and sent to your
              registered email address.
            </p>
          )}
          {selectedSupport === "updates" && (
            <p>
              Stay updated with the latest platform features and improvements. We regularly update our giving platform
              to serve you better.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">
        {selectedPayment === "card" && "Card Payment"}
        {selectedPayment === "local-bank-transfer" && "USSD Payment"}
        {selectedPayment === "bank-transfer" && "Bank Transfer"}
        {selectedPayment === "churchpad" && "ChurchPad Payment"}
      </h3>

      <div className="text-gray-300 text-sm">
        {selectedPayment === "card" && "Secure card payment processing through multiple providers"}
        {selectedPayment === "local-bank-transfer" && "Pay using local bank transfer options"}
        {selectedPayment === "bank-transfer" && "Direct bank transfer for local and international gifts"}
        {selectedPayment === "churchpad" && "International gifts through ChurchPad platform"}
      </div>

      <PaymentProviders />

      <p className="text-sm text-red-400 italic">Please note, any of the listed channels can accept your card</p>
    </div>
  )
}
