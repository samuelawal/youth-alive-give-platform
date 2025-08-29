"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  User,
  CreditCard,
  Calendar,
  DollarSign,
  Hash,
  Phone,
  Mail,
  MessageSquare,
  Building,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
} from "lucide-react";
import { Transaction } from "@/types/transaction";
import toast from "react-hot-toast";

interface TransactionDetailsProps {
  transaction: Transaction;
  onBack: () => void;
}

export default function TransactionDetails({ transaction, onBack }: TransactionDetailsProps) {
  const { collection } = transaction;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Successful":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Successful":
        return "bg-green-100 text-green-800 border-green-200";
      case "Failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  const transactionDate = formatDate(transaction?.time);
  const collectionDate = formatDate(collection?.time);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-2 p-0 h-auto text-[#52024F] hover:text-[#52024F]/80"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Transactions
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Transaction Details</h2>
          <p className="text-gray-600 text-sm mt-1">
            Complete information for transaction {transaction?.id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Overview */}
        <Card className="p-6 border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#52024F]/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-[#52024F]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Transaction Overview</h3>
              <p className="text-gray-600 text-sm">Basic transaction information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Transaction ID</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gray-900">{transaction?.id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(transaction?.id, "Transaction ID")}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Collection No</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gray-900">{collection?.collectionNo}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(collection.collectionNo, "Collection Number")}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(collection?.collectionStatus)}
                <span className="text-sm font-medium text-gray-700">Status</span>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(collection?.collectionStatus)}`}>
                {collection?.collectionStatus}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Amount</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {collection?.currency} {collection?.amount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Offering Type</span>
              </div>
              <span className="text-sm text-gray-900">{collection?.collectionType?.name}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Payment Gateway</span>
              </div>
              <span className="text-sm text-gray-900">{collection?.paymentGateway}</span>
            </div>
          </div>
        </Card>

        {/* Donor Information */}
        <Card className="p-6 border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Donor Information</h3>
              <p className="text-gray-600 text-sm">Details about the donor</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Full Name</span>
              </div>
              <span className="text-sm text-gray-900 font-medium">
                {collection?.firstName} {collection?.lastName}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900">{collection?.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(collection?.email, "Email")}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Phone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900">{collection?.phoneNumber}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(collection?.phoneNumber, "Phone number")}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {collection?.customerNumber && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Customer Number</span>
                </div>
                <span className="text-sm text-gray-900 font-mono">{collection?.customerNumber}</span>
              </div>
            )}

            {collection?.countryCode && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Country</span>
                </div>
                <span className="text-sm text-gray-900">{collection.countryCode}</span>
              </div>
            )}

            {collection?.comment && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Comment</span>
                </div>
                <p className="text-sm text-gray-900 leading-relaxed">{collection?.comment}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-6 lg:col-span-2 border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Transaction Timeline</h3>
              <p className="text-gray-600 text-sm">Key events in this transaction</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">Collection Created</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Collection record was created in the system
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  {collectionDate.date} at {collectionDate.time}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">Transaction Processed</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Payment was processed through {collection?.paymentGateway}
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  {transactionDate?.date} at {transactionDate?.time}
                </div>
              </div>
            </div>

            <div className={`flex items-start gap-4 p-4 rounded-lg border-l-4 ${
              collection?.collectionStatus === "Successful"
                ? "bg-green-50 border-green-400"
                : collection?.collectionStatus === "Failed"
                ? "bg-red-50 border-red-400"
                : "bg-yellow-50 border-yellow-400"
            }`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                collection?.collectionStatus === "Successful"
                  ? "bg-green-400"
                  : collection?.collectionStatus === "Failed"
                  ? "bg-red-400"
                  : "bg-yellow-400"
              }`}>
                {getStatusIcon(collection?.collectionStatus)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">
                  Transaction {collection?.collectionStatus}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {collection?.collectionStatus === "Successful"
                    ? "Payment completed successfully"
                    : collection?.collectionStatus === "Failed"
                    ? "Payment failed or was declined"
                    : "Payment is still being processed"}
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  Status last updated: {transactionDate.date} at {transactionDate.time}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        {(collection?.collectionReference || collection?.customerBankCode) && (
          <Card className="p-6 lg:col-span-2 border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Hash className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Additional Information</h3>
                <p className="text-gray-600 text-sm">Extra details and references</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collection?.collectionReference && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Collection Reference</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-900">{collection?.collectionReference}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(collection?.collectionReference, "Collection Reference")}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {collection?.customerBankCode && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Bank Code</span>
                  </div>
                  <span className="font-mono text-sm text-gray-900">{collection?.customerBankCode}</span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
