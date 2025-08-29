"use client"

const paymentProviders = [
  { name: "Paystack", icon: "💳", active: false },
  { name: "GT Bank", icon: "🏦", active: false },
  { name: "Paystack", icon: "💳", active: true },
  { name: "Xcel", icon: "📱", active: false },
  { name: "SeerBit", icon: "💰", active: false },
  { name: "Leatherback", icon: "🔄", active: false },
  { name: "Payaza", icon: "⚡", active: false },
]

export default function PaymentProviders() {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {paymentProviders.map((provider, index) => (
        <div
          key={index}
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all ${
            provider.active ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-xs">{provider.icon}</div>
          <div className={`w-3 h-3 rounded-full ${provider.active ? "bg-blue-400" : "bg-gray-400"}`} />
          <span className="text-xs text-gray-300">{provider.name}</span>
        </div>
      ))}
    </div>
  )
}
