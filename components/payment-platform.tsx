"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import LeftPanel from "./left-panel"
import PaymentForm from "./payment-form"

type PaymentMethod = "card" | "local-bank-transfer" | "bank-transfer" | "churchpad"
type SupportOption = "support" | "report" | "updates" | "transactions"

export default function PaymentPlatform() {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("card")
  const [selectedSupport, setSelectedSupport] = useState<SupportOption | null>(null)
  const [formData, setFormData] = useState({
    currency: "",
    amount: "",
    offeringType: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    comment: "",
    bank: "",
    country: "",
  })

  const handlePaymentClick = (method: PaymentMethod) => {
    setSelectedPayment(method)
    setSelectedSupport(null)
    console.log(`[v0] Payment method changed to: ${method}`)
  }

  const handleSupportClick = (option: SupportOption) => {
    setSelectedSupport(option)
    console.log(`[v0] Support option selected: ${option}`)
  }

  const handleSupportBack = () => {
    setSelectedSupport(null)
    console.log(`[v0] Returning from support to main view`)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    console.log(`[v0] Form field ${field} updated:`, value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Giver submitted successfully!")
  }

  return (
    <div className="min-h-screen bg-[#50034D] lg:bg-transparent flex flex-col lg:flex-row">
      <LeftPanel
        selectedPayment={selectedPayment}
        selectedSupport={selectedSupport}
        onPaymentClick={handlePaymentClick}
        onSupportClick={handleSupportClick}
      />

      {/* Right Panel - Dynamic Form */}
      <div className="flex-1 lg:w-[60%] bg-white lg:p-16 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedPayment}-${selectedSupport}`}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ 
                duration: 0.3,
                type: "spring",
                stiffness: 150,
                damping: 12
              }}
              className="h-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                <PaymentForm
                  selectedPayment={selectedPayment}
                  selectedSupport={selectedSupport}
                  formData={formData}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  onSupportBack={handleSupportBack}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
