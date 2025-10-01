"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import apiClient from "@/lib/api-client";

interface MomoPaymentStatusProps {
  collectionNo: string;
  transactionReference: string;
  amount: string;
  currency: string;
  donorName: string;
  offeringType: string;
  phoneNumber: string;
  onPaymentCompleted: () => void;
  onBackToForm: () => void;
}

export default function MomoPaymentStatus({
  collectionNo,
  transactionReference,
  amount,
  currency,
  donorName,
  offeringType,
  phoneNumber,
  onPaymentCompleted,
  onBackToForm,
}: MomoPaymentStatusProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'completed' | 'failed'>('pending');

  const handleVerifyPayment = async () => {
    setIsVerifying(true);
    
    try {
      // Call the complete endpoint
      const response = await apiClient.put('collections/complete', {
        collectionNo: collectionNo
      });      const { collection, transactionStatus } = response.data;
      
      const isCollectionSuccessful = collection?.collectionStatus === "Successful";
      const isTransactionCompleted = transactionStatus?.transaction_status === "Completed";
      
      if (isCollectionSuccessful && isTransactionCompleted) {
        setVerificationStatus('completed');
        toast.success("Payment verified successfully!");
        
        // Clean up localStorage
        localStorage.removeItem('currentCollectionNo');
        localStorage.removeItem('currentCollectionReference');
        localStorage.removeItem(`processed_${collectionNo}`);
        
        // Wait a moment then show transaction table
        setTimeout(() => {
          onPaymentCompleted();
        }, 2000);
        
      } else {
        setVerificationStatus('failed');
        const statusMessage = !isCollectionSuccessful && !isTransactionCompleted 
          ? "Both collection and transaction statuses are incomplete"
          : !isCollectionSuccessful 
            ? "Collection status is not successful"
            : "Transaction status is not completed";
            
        toast.error(`Payment verification failed: ${statusMessage}. Please try again or contact support.`);
      }
      
    } catch (error) {
      console.error("Error verifying payment:", error);
      setVerificationStatus('failed');
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || "Verification failed";
        toast.error(`Payment verification failed: ${errorMessage}`);
      } else {
        toast.error("Failed to verify payment. Please try again or contact support.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'completed':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'completed':
        return {
          title: "Payment Verified Successfully!",
          message: "Your mobile money payment has been confirmed. Redirecting to transaction history...",
          color: "text-green-700"
        };
      case 'failed':
        return {
          title: "Payment Verification Failed",
          message: "We couldn't verify your payment. Please try again or contact support if money was deducted.",
          color: "text-red-700"
        };
      default:
        return {
          title: "Mobile Money Payment Initiated",
          message: "Please complete the payment on your mobile device and click the button below to verify.",
          color: "text-yellow-700"
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="max-w-[800px] mx-auto mt-8">
      <Card className="w-full border-gray-50">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className={`text-xl font-bold ${statusInfo.color}`}>
            {statusInfo.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className={`text-center ${statusInfo.color}`}>
            {statusInfo.message}
          </p>
          
          {/* Transaction Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-gray-800 mb-3">Transaction Details</h3>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Reference:</div>
              <div className="font-mono text-[#52024F]">{transactionReference}</div>
              
              <div className="text-gray-600">Amount:</div>
              <div className="font-semibold">{currency} {amount}</div>
              
              <div className="text-gray-600">Donor:</div>
              <div className="font-semibold">{donorName}</div>
              
              <div className="text-gray-600">Offering:</div>
              <div className="font-semibold">{offeringType}</div>
              
              <div className="text-gray-600">Phone:</div>
              <div className="font-mono">{phoneNumber}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {verificationStatus === 'pending' && (
              <Button
                onClick={handleVerifyPayment}
                disabled={isVerifying}
                className="w-full bg-[#50034D] hover:opacity-80 disabled:bg-purple-400 text-white py-5 text-sm font-semibold"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying Payment...
                  </div>
                ) : (
                  "I Have Completed Payment"
                )}
              </Button>
            )}
            
            {verificationStatus === 'failed' && (
              <>
                <Button
                  onClick={handleVerifyPayment}
                  disabled={isVerifying}
                  className="w-full bg-[#50034D] hover:opacity-80 disabled:bg-purple-400 text-white py-3"
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying Payment...
                    </div>
                  ) : (
                    "Try Verify Again"
                  )}
                </Button>
                
                <Button
                  onClick={onBackToForm}
                  variant="outline"
                  className="w-full py-3"
                >
                  Back to Payment Form
                </Button>
              </>
            )}
          </div>

          {/* Instructions */}
          {verificationStatus === 'pending' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Payment Instructions:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Check your phone for mobile money prompt</li>
                <li>• Enter your mobile money PIN</li>
                <li>• Confirm the transaction</li>
                <li>• Click &quot;I Have Completed Payment&quot; below</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
