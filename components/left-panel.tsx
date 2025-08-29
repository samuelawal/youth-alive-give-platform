"use client"
import { useState } from "react"
import PaymentButtons from "./payment-buttons"
import Image from "next/image"
import { HelpCircle, History, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type PaymentMethod = "card" | "local-bank-transfer" | "bank-transfer" | "churchpad"
type SupportOption = "support" | "report" | "updates" | "transactions"

interface LeftPanelProps {
  selectedPayment: PaymentMethod
  selectedSupport: SupportOption | null
  onPaymentClick: (method: PaymentMethod) => void
  onSupportClick: (option: SupportOption) => void
}

export default function LeftPanel({
  selectedPayment,
  selectedSupport,
  onPaymentClick,
  onSupportClick,
}: LeftPanelProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Support and Information options with icons
  const supportOptions = [
    {
      id: "support" as SupportOption,
      label: "Support",
      icon: HelpCircle,
    },
    // {
    //   id: "report" as SupportOption,
    //   label: "Get Report",
    //   icon: FileText,
    // },
    // {
    //   id: "updates" as SupportOption,
    //   label: "Updates",
    //   icon: Bell,
    // },
    {
      id: "transactions" as SupportOption,
      label: "Transaction History",
      icon: History,
    },
  ];

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handlePaymentClick = (method: PaymentMethod) => {
    onPaymentClick(method);
    closeMobileSidebar(); // Close sidebar after selection on mobile
  };

  const handleSupportClick = (option: SupportOption) => {
    onSupportClick(option);
    closeMobileSidebar(); // Close sidebar after selection on mobile
  };

  // Mobile Header Component
  const MobileHeader = () => (
    <div className="lg:hidden bg-[#50034D] p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Image
          src="/winners-logo.png"
          alt="Winners Chapel Logo"
          width={40}
          height={40}
          className="object-contain"
        />
        <Image
          src="/youth-alive-logo.png"
          alt="Youth Alive Logo"
          width={40}
          height={40}
          className="object-contain"
        />
        <h1 className="text-white text-sm font-bold">
          YOUTH ALIVE GIVING
        </h1>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMobileSidebar}
        className="text-white hover:bg-white/10 p-2"
      >
        <Menu className="h-6 w-6" />
      </Button>
    </div>
  );

  // Sidebar Content Component
  const SidebarContent = () => (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex items-center space-x-4">
          <Image
            src="/winners-logo.png"
            alt="Winners Chapel Logo"
            width={60}
            height={60}
            className="object-contain"
          />
          <Image
            src="/youth-alive-logo.png"
            alt="Youth Alive Logo"
            width={60}
            height={60}
            className="object-contain"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-white text-base lg:text-2xl font-bold leading-tight">
            YOUTH ALIVE ONLINE <br className="hidden lg:block" />
            GIVING PLATFORM
          </h1>
        </div>
      </div>

      {/* Giving Options */}
      <div className="pt-12">
        <h3 className="text-white text-lg lg:text-2xl font-bold mb-4">
          GIVING OPTIONS
        </h3>
        <PaymentButtons
          selectedPayment={selectedPayment}
          selectedSupport={selectedSupport}
          onPaymentClick={handlePaymentClick}
          onSupportClick={handleSupportClick}
        />
      </div>

      {/* Support and Information Section */}
      <div className="flex-1">
        <h3 className="text-white text-lg lg:text-xl font-bold mb-4">
          SUPPORT AND INFORMATION
        </h3>
        
        <div className="space-y-3">
          {supportOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleSupportClick(option.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                  selectedSupport === option.id
                    ? "bg-white text-[#52024F] font-semibold"
                    : "bg-transparent text-white hover:bg-[#52024F]/20 hover:text-white"
                }`}
              >
                <IconComponent 
                  className={`w-5 h-5 ${
                    selectedSupport === option.id ? "text-[#52024F]" : "text-white"
                  }`} 
                />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-full lg:w-[40%] bg-[#50034D] p-6 lg:p-16">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-80 bg-[#50034D] z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={closeMobileSidebar}
              className="text-white hover:bg-white/10 p-2"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Sidebar Content */}
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
