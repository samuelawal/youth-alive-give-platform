"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import TransactionHistory from "./transaction-history"

type SupportOption = "support" | "report" | "updates" | "transactions"

interface SupportFormsProps {
  selectedSupport: SupportOption
  onBack?: () => void
}

export default function SupportForms({ selectedSupport, onBack }: SupportFormsProps) {
  // If transaction history is selected, render the TransactionHistory component
  if (selectedSupport === "transactions") {
    return <TransactionHistory onBack={onBack || (() => {})} />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {selectedSupport === "support" && "Contact Support"}
        {selectedSupport === "report" && "Get Report"}
        {selectedSupport === "updates" && "Platform Updates"}
      </h2>

      {selectedSupport === "support" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="support-name" className="text-gray-600">
              Full Name
            </Label>
            <Input id="support-name" type="text" className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="support-email" className="text-gray-600">
              Email Address
            </Label>
            <Input id="support-email" type="email" className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="support-issue" className="text-gray-600">
              Issue Category
            </Label>
            <Select>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment">Payment Issues</SelectItem>
                <SelectItem value="technical">Technical Problems</SelectItem>
                <SelectItem value="account">Account Issues</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="support-message" className="text-gray-600">
              Message
            </Label>
            <Textarea id="support-message" className="mt-1" rows={4} required />
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">SUBMIT SUPPORT REQUEST</Button>
        </div>
      )}

      {selectedSupport === "report" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="report-email" className="text-gray-600">
              Email Address
            </Label>
            <Input id="report-email" type="email" className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="report-period" className="text-gray-600">
              Report Period
            </Label>
            <Select>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3">GENERATE REPORT</Button>
        </div>
      )}

      {selectedSupport === "updates" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="update-email" className="text-gray-600">
              Email Address
            </Label>
            <Input id="update-email" type="email" className="mt-1" required />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-600">Notification Preferences</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Platform Updates</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">New Features</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Maintenance Notifications</span>
              </label>
            </div>
          </div>
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3">SUBSCRIBE TO UPDATES</Button>
        </div>
      )}
    </div>
  )
}
