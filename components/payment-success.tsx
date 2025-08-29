"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Share2, ArrowLeft, X } from "lucide-react";

interface PaymentSuccessProps {
  donorName: string;
  transactionReference: string;
  amount: string;
  currency: string;
  offeringType: string;
  onBackToHome: () => void;
}

export default function PaymentSuccess({
  donorName,
  transactionReference,
  amount,
  currency,
  offeringType,
  onBackToHome,
}: PaymentSuccessProps) {
  const handleDownloadReceipt = () => {
    // Create a simple receipt content
    const receiptContent = `
DONATION RECEIPT
================

Thank you for your generous donation!

Donor: ${donorName}
Amount: ${currency.toUpperCase()} ${amount}
Offering Type: ${offeringType}
Transaction Reference: ${transactionReference}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Living Faith Church Worldwide
Faith Tabernacle

God bless you!
================
    `;

    // Create and download the receipt
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donation-receipt-${transactionReference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShareReceipt = async () => {
    const shareData = {
      title: 'Donation Receipt',
      text: `I just made a donation to Living Faith Church Worldwide. Transaction Reference: ${transactionReference}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `Donation successful! Reference: ${transactionReference}`
        );
        alert('Receipt details copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `Donation successful! Reference: ${transactionReference}`
        );
        alert('Receipt details copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center relative">
      {/* Close Button */}
      <button
        onClick={onBackToHome}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Close and go back to main screen"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>

      {/* Success Icon */}
      <div className="mb-6">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Successful!
        </h2>

      </div>

      {/* Transaction Details */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Transaction Details
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Donor Name:</span>
            <span className="font-medium text-gray-800">{donorName}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium text-gray-800">
              {currency.toUpperCase()} {amount}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Offering Type:</span>
            <span className="font-medium text-gray-800 capitalize">
              {offeringType.replace('-', ' ')}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium text-gray-800">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Reference:</span>
              <span className="font-mono text-sm font-medium text-blue-600 break-all">
                {transactionReference}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <Button
            onClick={handleDownloadReceipt}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </Button>
          
          <Button
            onClick={handleShareReceipt}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
        
        <Button
          onClick={onBackToHome}
          className="w-full bg-purple-800 hover:bg-purple-900 text-white flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Make Another Donation
        </Button>
      </div>

      {/* Additional Message */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>God bless you!</strong> Your contribution will help empower youth and advance the Kingdom of God. 
          A receipt has been prepared for your records.
        </p>
      </div>
    </div>
  );
}
