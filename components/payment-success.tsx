"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Share2, ArrowLeft, X, History } from "lucide-react";
import TransactionHistory from "./transaction-history";

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
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // If showing transaction history, render that component
  if (showTransactionHistory) {
    return (
      <div className="w-full">
        <div className="mb-4 flex items-center gap-4">
          <Button
            onClick={() => setShowTransactionHistory(false)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Receipt
          </Button>
          <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
        </div>
        <TransactionHistory onBack={() => setShowTransactionHistory(false)} />
      </div>
    );
  }
  const handleDownloadReceipt = async () => {
    try {
      setIsDownloading(true);
      
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Create receipt HTML content dynamically
      const receiptHTML = `
        <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header with Logo Area -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #50034D; padding-bottom: 20px;">
            <h1 style="color: #50034D; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">
              GIVER RECEIPT
            </h1>
            <div style="color: #666; font-size: 16px; line-height: 1.4;">
              <strong>Living Faith Church Worldwide</strong><br/>
              Faith Tabernacle<br/>
              Youth Alive Give Platform
            </div>
          </div>

          <!-- Success Message -->
          <div style="text-align: center; margin: 20px 0 30px 0; padding: 15px; background-color: #f0f9ff; border-radius: 8px; border: 1px solid #0ea5e9;">
            <p style="color: #0369a1; font-size: 18px; margin: 0; font-weight: 600;">
              ✓ Payment Completed Successfully
            </p>
          </div>

          <!-- Transaction Details -->
          <div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #f9fafb; padding: 15px; border-bottom: 1px solid #e5e7eb;">
              <h3 style="margin: 0; font-size: 18px; color: #374151; font-weight: 600;">
                Transaction Details
              </h3>
            </div>
            
            <div style="padding: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                    Donor Name:
                  </td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                    ${donorName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                    Amount:
                  </td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                    ${currency.toUpperCase()} ${amount}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                    Offering Type:
                  </td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; text-transform: capitalize;">
                    ${offeringType.replace('-', ' ')}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                    Date & Time:
                  </td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                    ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
                  </td>
                </tr>
                <tr style="border-top: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                    Transaction Reference:
                  </td>
                  <td style="padding: 12px 0 8px 0; color: #2563eb; font-size: 12px; font-family: monospace; font-weight: 600; text-align: right; word-break: break-all;">
                    ${transactionReference}
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Thank You Message -->
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #fef3e2; border-radius: 8px; border: 1px solid #f59e0b;">
            <p style="color: #92400e; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
              God bless you for your generous contribution!
            </p>
            <p style="color: #a16207; font-size: 14px; margin: 0; line-height: 1.4;">
              Your gift will help empower youth and advance the Kingdom of God worldwide.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">
              This is an official receipt for your gift.<br/>
              For any queries, please contact our support team.
            </p>
            <p style="margin: 10px 0 0 0; font-weight: 600;">
              Living Faith Church Worldwide - Faith Tabernacle
            </p>
          </div>
        </div>
      `;
      
      // Configure html2pdf options
      const options = {
        margin: 0.5,
        filename: `giver-receipt-${transactionReference}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };

      // Generate and download PDF
      await html2pdf()
        .set(options)
        .from(receiptHTML)
        .save();
        
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareReceipt = async () => {
    const shareData = {
      title: 'Giver Receipt',
      text: `I just made a gift to Living Faith Church Worldwide. Transaction Reference: ${transactionReference}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `Gift successful! Reference: ${transactionReference}`
        );
        alert('Receipt details copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `Gift successful! Reference: ${transactionReference}`
        );
        alert('Receipt details copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
  };

  return (
    <>
      {/* Visible UI */}
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
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Receipt
              </>
            )}
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
          onClick={() => setShowTransactionHistory(true)}
          className="w-full bg-[#50034D] hover:opacity-80 text-white flex items-center justify-center gap-2"
        >
          <History className="w-4 h-4" />
          View Transaction History
        </Button>
        
        <Button
          onClick={onBackToHome}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Make Another Gift
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
    </>
  );
}
