"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import SupportForms from "./support-forms";
import PaymentSuccess from "./payment-success";
import PayazaCheckout from "payaza-web-sdk";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import toast from "react-hot-toast";

// Payaza SDK types
interface PayazaResponse {
  status?: string | number;
  [key: string]: unknown;
}

// API Types
interface OfferingType {
  id: string;
  name: string;
  status: boolean;
  time: string;
}

interface BankAccount {
  id: string;
  bankShortName: string;
  bankName: string;
  bankAddress: string;
  swiftCode: string;
  routingNumber: string;
  beneficiaryBank: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  collectionTypeId: string;
  collectionType: {
    id: string;
    name: string;
    status: boolean;
    time: string;
  };
  status: boolean;
  local: boolean;
  time: string;
}

type PaymentMethod =
  | "card"
  | "local-bank-transfer"
  | "bank-transfer"
  | "churchpad";
type SupportOption = "support" | "report" | "updates" | "transactions";

interface FormData {
  currency: string;
  amount: string;
  offeringType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  comment: string;
  bank: string;
  country: string;
}

interface DonationFormProps {
  selectedPayment: PaymentMethod;
  selectedSupport: SupportOption | null;
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSupportBack?: () => void;
}
const bankAccountData = {
  "transport-offering": [
    {
      bank: "EcoBank",
      accountName: "Faith Tabernacle - Transport",
      accountNumber: "2263006684",
    },
    {
      bank: "Providus Bank",
      accountName: "Faith Tabernacle - Transport",
      accountNumber: "1304910428",
    },
    {
      bank: "Wema Bank",
      accountName: "Faith Tabernacle - Transport",
      accountNumber: "0125682066",
    },
  ],
  "kingdom-care-covenant": [
    {
      bank: "Zenith Bank",
      accountName: "Faith Tabernacle - Kingdom Care Covenant",
      accountNumber: "1016104355",
    },
    {
      bank: "Providus Bank",
      accountName: "Faith Tabernacle - Kingdom Care Covenant",
      accountNumber: "1304910411",
    },
    {
      bank: "Wema Bank",
      accountName: "Faith Tabernacle - Kingdom Care Covenant",
      accountNumber: "0125683472",
    },
  ],
  "shiloh-sacrifice": [
    {
      bank: "UBA",
      accountName: "Faith Tabernacle Sacrifice",
      accountNumber: "1022239548",
    },
    {
      bank: "Access Bank",
      accountName: "Faith Tabernacle Sacrifice",
      accountNumber: "1839291324",
    },
    {
      bank: "GT Bank",
      accountName: "Faith Tabernacle Sacrifice",
      accountNumber: "0132010587",
    },
    {
      bank: "Zenith Bank",
      accountName: "Faith Tabernacle Sacrifice",
      accountNumber: "1012847670",
    },
  ],
  offering: [
    {
      bank: "Access Bank",
      accountName: "Faith Tabernacle - Offering",
      accountNumber: "0826574002",
    },
    {
      bank: "EcoBank",
      accountName: "Living Faith Church",
      accountNumber: "2262006807",
    },
    {
      bank: "Fidelity Bank",
      accountName: "Living Faith Church",
      accountNumber: "5080103271",
    },
  ],
  tithe: [
    {
      bank: "Zenith Bank",
      accountName: "Faith Tabernacle - Tithe",
      accountNumber: "1016641144",
    },
    {
      bank: "First City Monument Bank (FCMB)",
      accountName: "Living Faith Church / World Mission Agency",
      accountNumber: "2682946011",
    },
    {
      bank: "UBA",
      accountName: "Living Faith Church WW-Tithe",
      accountNumber: "1002821154",
    },
  ],
  "mission-adoption-scheme": [
    {
      bank: "First Bank",
      accountName: "LFC Mission Adoption",
      accountNumber: "2034540219",
    },
  ],
  "ark-project": [
    {
      bank: "Zenith Bank",
      accountName: "Faith Tabernacle Ark Project",
      accountNumber: "1014503590",
    },
    {
      bank: "United Bank for Africa (UBA)",
      accountName: "Faith Tabernacle Ark Project",
      accountNumber: "1020550238",
    },
  ],
  "rural-building-project": [
    {
      bank: "First Bank",
      accountName: "LFC - Rural Church Building",
      accountNumber: "2014366167",
    },
  ],
};

const paymentProviders = [
  { id: "payaza", name: "PAYAZA", icon: "/payaza.svg", bgColor: "bg-white" },
  { id: "momo", name: "MOMO PSB", icon: "/momo.svg", bgColor: "bg-white" },
];

export default function PaymentForm({
  selectedPayment,
  selectedSupport,
  formData,
  onInputChange,
  onSubmit,
  onSupportBack,
}: DonationFormProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCompletingCollection, setIsCompletingCollection] = useState(false);
  const [selectedOfferingType, setSelectedOfferingType] = useState<string>("");
  const [offeringTypes, setOfferingTypes] = useState<OfferingType[]>([]);
  const [isLoadingOfferingTypes, setIsLoadingOfferingTypes] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoadingBankAccounts, setIsLoadingBankAccounts] = useState(false);

  // Track the last processed reference to prevent duplicates
  const [lastProcessedReference, setLastProcessedReference] = useState<string | null>(null);

  // Success screen state
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successData, setSuccessData] = useState<{
    donorName: string;
    transactionReference: string;
    amount: string;
    currency: string;
    offeringType: string;
  } | null>(null);

  // Fetch offering types from API
  const fetchOfferingTypes = useCallback(async () => {
    try {
      setIsLoadingOfferingTypes(true);
      const response = await axios.get<OfferingType[]>(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}collection-types`);
      setOfferingTypes(response.data);
    } catch (error) {
      console.error('Error fetching offering types:', error);
      // Fallback to default offering types if API fails
      setOfferingTypes([
        { id: 'tithe', name: 'Tithe', status: true, time: new Date().toISOString() },
        { id: 'offering', name: 'Offering', status: true, time: new Date().toISOString() },
        { id: 'seed', name: 'Seed Offering', status: true, time: new Date().toISOString() },
        { id: 'special', name: 'Special Offering', status: true, time: new Date().toISOString() },
        { id: 'building', name: 'Building Fund', status: true, time: new Date().toISOString() },
        { id: 'missions', name: 'Missions', status: true, time: new Date().toISOString() },
      ]);
    } finally {
      setIsLoadingOfferingTypes(false);
    }
  }, []);

  // Fetch bank accounts for selected collection type
  const fetchBankAccounts = useCallback(async (collectionTypeId: string) => {
    try {
      setIsLoadingBankAccounts(true);
      const response = await axios.get<BankAccount[]>(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}bank-account/local?pageNumber=0&pageSize=100&collectionTypeId=${collectionTypeId}`
      );
      setBankAccounts(response.data);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      setBankAccounts([]);
      // Show user-friendly error message
      toast.error('Failed to load bank accounts. Please try again.');
    } finally {
      setIsLoadingBankAccounts(false);
    }
  }, []);

    const fetchInternationalBankAccounts = useCallback(async (collectionTypeId: string) => {
    try {
      setIsLoadingBankAccounts(true);
      const response = await axios.get<BankAccount[]>(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}bank-account/international?pageNumber=0&pageSize=100&collectionTypeId=${collectionTypeId}`
      );
      setBankAccounts(response.data);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      setBankAccounts([]);
      // Show user-friendly error message
      toast.error('Failed to load international bank accounts. Please try again.');
    } finally {
      setIsLoadingBankAccounts(false);
    }
  }, []);

  // Load offering types on component mount
  useEffect(() => {
    fetchOfferingTypes();
  }, [fetchOfferingTypes]);

  // Load Payaza SDK dynamically
  const loadPayazaSDK = useCallback(() => {
    return new Promise<void>((resolve) => {
      // Since we're importing directly, no need to load dynamically
      resolve();
    });
  }, []);

  // Handle collection completion
  const handleCollectionComplete = useCallback(async (collectionNo: string, reference: string, _paymentResponse: PayazaResponse) => {
    // Prevent multiple simultaneous calls
    if (isCompletingCollection) {

      return;
    }
    
    // Check if this collection has already been processed
    const processedKey = `processed_${collectionNo}`;
    if (localStorage.getItem(processedKey)) {
      return;
    }
    
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      setIsCompletingCollection(true);
      
      // Mark as being processed
      localStorage.setItem(processedKey, 'true');
      
      
      // Set a timeout for the collection completion
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Collection completion timeout after 30 seconds'));
        }, 30000); // 30 seconds timeout
      });

      const completionPromise = axios.put(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}collections/complete`, {
        collectionNo: collectionNo
      });
      
      const response = await Promise.race([completionPromise, timeoutPromise]);
      
      // Type guard to ensure we have an axios response
      if (!response || typeof response !== 'object' || !('data' in response)) {
        throw new Error('Invalid response from collection completion');
      }
      
      const axiosResponse = response as { data: { collection: { collectionStatus: string }, transactionStatus: { transaction_status: string } } };
      
      // Clear timeout if request completed successfully
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      

      
      // Check if collection was completed successfully
      const { collection, transactionStatus } = axiosResponse.data;
      
      // Log the response structure for debugging

      
      const isCollectionSuccessful = collection?.collectionStatus === "Successful";
      const isTransactionCompleted = transactionStatus?.transaction_status === "Completed";
      
      if (isCollectionSuccessful && isTransactionCompleted) {
        
        // Clear localStorage
        localStorage.removeItem('currentCollectionNo');
        localStorage.removeItem('currentCollectionReference');
        localStorage.removeItem(processedKey); // Clean up processed flag
        
        // Set success data and show success screen
        setSuccessData({
          donorName: `${formData.firstName} ${formData.lastName}`,
          transactionReference: reference,
          amount: formData.amount,
          currency: formData.currency,
          offeringType: formData.offeringType || "donation",
        });
        setShowSuccessScreen(true);
        setIsProcessingPayment(false);
        setIsCompletingCollection(false);
        
        toast.success("Payment completed successfully!");
      } else {

        
        const statusMessage = !isCollectionSuccessful && !isTransactionCompleted 
          ? "Both collection and transaction statuses are incomplete"
          : !isCollectionSuccessful 
            ? "Collection status is not successful"
            : "Transaction status is not completed";
            
        toast.error(`Payment processing incomplete: ${statusMessage}. Please contact support if amount was deducted.`);
        localStorage.removeItem(processedKey); // Clean up processed flag on failure
        setIsProcessingPayment(false);
        setIsCompletingCollection(false);
      }
      
    } catch (error: unknown) {
      // Clear timeout if there's an error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      

      
      // Clean up processed flag on error
      const processedKey = `processed_${collectionNo}`;
      localStorage.removeItem(processedKey);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        toast.error("Collection completion is taking longer than expected. Please contact support if amount was deducted.");
      } else {
        toast.error("Payment was successful but there was an error completing the record. Please contact support.");
      }
      
      setIsProcessingPayment(false);
      setIsCompletingCollection(false);
    }
  }, [formData]);

  // Handle Payaza payment
  const handlePayazaPayment = useCallback(async () => {
    if (!formData.email || !formData.amount || !formData.currency || !formData.offeringType) {
      toast.error("Please fill in all required fields (email, amount, currency, offering type)");
      return;
    }

    // Check if Payaza merchant key is configured
    const merchantKey = process.env.NEXT_PUBLIC_PAYAZA_PUBLIC_KEY;

    console.log(merchantKey, 'merchantKey')
    if (!merchantKey) {
      toast.error("Payment configuration error. Please contact support.");
      return;
    }

    try {
      setIsProcessingPayment(true);
      setLastProcessedReference(null); // Reset for new payment
      await loadPayazaSDK();

      // Generate unique reference with 8-character UUID
      const reference = `${uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase()}`;

      // First, create collection record via API
      const collectionPayload = {
        paymentGateway: "PAYAZA",
        currency: formData.currency.toUpperCase(),
        amount: parseFloat(formData.amount),
        collectionTypeId: formData.offeringType,
        collectionReference: reference,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        comment: formData.comment || ""
      };


      const collectionResponse = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}collections`, collectionPayload);
      const { collectionNo } = collectionResponse.data;
      
      
      // Save collectionNo to localStorage for later use
      localStorage.setItem('currentCollectionNo', collectionNo);
      localStorage.setItem('currentCollectionReference', reference);

      const config = {
        merchant_key: merchantKey,
        email_address: formData.email,
        checkout_amount: parseFloat(formData.amount),
        currency: formData.currency.toUpperCase(),
        transaction_reference: reference,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phone,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        connection_mode: 'Test' as any, // Use Test mode for development
        callback: (response: object) => {
          const typedResponse = response as PayazaResponse;
       
          
          if (
            typedResponse.status === "success" ||
            typedResponse.status === 201
          ) {
            // Check if this reference has already been processed
            if (lastProcessedReference === reference) {

              return;
            }
            
            setLastProcessedReference(reference);
            // Complete the collection via API
            handleCollectionComplete(collectionNo, reference, typedResponse);
          } else {
            toast.error("Payment failed. Please try again.");
            setIsProcessingPayment(false);
          }
        },
        onClose: () => {
          setIsProcessingPayment(false);
        },
      };

      console.log(config, 'config')

      // Initialize Payaza checkout
      
      const payazaInstance = PayazaCheckout.setup(config);
      payazaInstance.showPopup();
      console.log("Payaza instance created:", payazaInstance);
      
    } catch (error) {
      console.error("Error initializing Payaza or creating collection:", error);
      toast.error("Failed to initialize payment. Please try again.");
      setIsProcessingPayment(false);
      
      // Clean up localStorage if collection creation failed
      localStorage.removeItem('currentCollectionNo');
      localStorage.removeItem('currentCollectionReference');
    }
  }, [formData, loadPayazaSDK, handleCollectionComplete, isCompletingCollection, lastProcessedReference]);

  // Handle back to home from success screen
  const handleBackToHome = useCallback(() => {
    setShowSuccessScreen(false);
    setSuccessData(null);
    setSelectedProvider(null);
    setIsProcessingPayment(false);
    setIsCompletingCollection(false);
    setLastProcessedReference(null); // Reset reference tracking
    // Clear form data if needed
    Object.keys(formData).forEach((key) => {
      onInputChange(key, "");
    });
  }, [formData, onInputChange]);

  // Handle form submission
  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // For card payments, ensure a provider is selected
      if (selectedPayment === "card" && !selectedProvider) {
        toast.error("Please select a payment provider (Payaza or MOMO PSB)");
        return;
      }

      if (selectedProvider === "payaza") {
        handlePayazaPayment();
      } else if (selectedProvider === "momo") {
        // Handle MOMO PSB payment
        toast("MOMO PSB integration coming soon!", {
          icon: "ℹ️",
          duration: 3000,
        });
      } else {
        // Default form submission for other payment methods
        onSubmit(e);
      }
    },
    [selectedPayment, selectedProvider, handlePayazaPayment, onSubmit]
  );

  if (selectedSupport) {
    return <SupportForms selectedSupport={selectedSupport} onBack={onSupportBack} />;
  }

  // Show success screen if payment was successful
  if (showSuccessScreen && successData) {
    return (
      <PaymentSuccess
        donorName={successData.donorName}
        transactionReference={successData.transactionReference}
        amount={successData.amount}
        currency={successData.currency}
        offeringType={successData.offeringType}
        onBackToHome={handleBackToHome}
      />
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getBankAccountsForOffering = (offeringType: string) => {
    return bankAccountData[offeringType as keyof typeof bankAccountData] || [];
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {selectedPayment === "card" && "Pay with Card"}
        {selectedPayment === "local-bank-transfer" && "Bank Transfer"}
        {selectedPayment === "bank-transfer" && "Bank Transfer Donation"}
        {selectedPayment === "churchpad" && "Payaza"}
      </h2>

      {selectedPayment === "card" && (
        <>
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center text-sm text-gray-600 mb-4 w-full">
              {!selectedProvider && "Please select a payment provider:"}
              {selectedProvider === "payaza" &&
                "✓ Payaza selected - Secure international payments"}
              {selectedProvider === "momo" &&
                "✓ MOMO PSB selected - Local mobile payments"}
            </div>
          </div>

          <div className="flex justify-center gap-8 mb-8">
            {paymentProviders.map((provider) => (
              <div key={provider.id} className="text-center">
                <button
                  type="button"
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`w-16 h-16 rounded-full ${
                    provider.bgColor
                  } shadow-2xl text-white text-2xl font-bold mb-2 hover:opacity-80 transition-all flex items-center justify-center p-2 cursor-pointer ${
                    selectedProvider === provider.id
                      ? "ring-4 ring-blue-500 ring-opacity-50"
                      : ""
                  }`}
                >
                  <Image
                    src={provider.icon}
                    alt={`${provider.name} logo`}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </button>
                <div
                  className={`w-4 h-4 border-2 rounded-full mx-auto mb-1 transition-all cursor-pointer ${
                    selectedProvider === provider.id
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 bg-white"
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                ></div>
                <div
                  className={`text-sm font-medium transition-colors ${
                    selectedProvider === provider.id
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {provider.name}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currency" className="text-gray-600 mb-2 block">
                Currency
              </Label>
              <Select
                onValueChange={(value) => onInputChange("currency", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ngn">NGN - Nigerian Naira</SelectItem>
                  <SelectItem value="usd">USD - US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="amount" className="text-gray-600 mb-2 block">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder=""
                value={formData.amount}
                onChange={(e) => onInputChange("amount", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="offering-type" className="text-gray-600 mb-2 block">
              Offering Type
            </Label>
            <Select
              onValueChange={(value) => onInputChange("offeringType", value)}
              disabled={isLoadingOfferingTypes}
            >
              <SelectTrigger className="w-full z-99">
                <SelectValue placeholder={
                  isLoadingOfferingTypes 
                    ? "Loading offering types..." 
                    : "Select Offering Type"
                } />
              </SelectTrigger>
              <SelectContent className="z-99 ">
                {offeringTypes.map((offeringType) => (
                  <SelectItem key={offeringType.id} value={offeringType.id}>
                    {offeringType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-gray-600 mb-2 block">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="your first name here"
                value={formData.firstName}
                onChange={(e) => onInputChange("firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-gray-600 mb-2 block">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="your last name here"
                value={formData.lastName}
                onChange={(e) => onInputChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-gray-600 mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your email here"
                value={formData.email}
                onChange={(e) => onInputChange("email", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-600 mb-2 block">
                Phone
              </Label>
              <div className="flex gap-2">
                <Select defaultValue="+234">
                  <SelectTrigger className="w-20 z-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+234">+234</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+27">+27</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="123 4567 890"
                  className="flex-1"
                  value={formData.phone}
                  onChange={(e) => onInputChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="comment" className="text-gray-600 mb-2 block">
              Comment
            </Label>
            <Textarea
              id="comment"
              placeholder="What is the offering for?"
              rows={4}
              value={formData.comment}
              onChange={(e) => onInputChange("comment", e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={isProcessingPayment || isCompletingCollection}
            className="w-full bg-[#50034D] hover:opacity-80 disabled:bg-purple-400 text-white py-6 text-lg font-semibold transition-colors"
          >
            {isCompletingCollection ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Completing Payment...
              </div>
            ) : isProcessingPayment ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing Payment...
              </div>
            ) : (
              "GIVE NOW"
            )}
          </Button>

          {isCompletingCollection && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 text-blue-700">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <p className="font-medium">Finalizing your donation...</p>
                  <p className="text-sm text-blue-600">Please don&apos;t close this window.</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {selectedPayment === "local-bank-transfer" && (
        <>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Select from the option below to view details
            </p>

            <div>
              <Select
                onValueChange={(value) => {
                  setSelectedOfferingType(value);
                  onInputChange("offeringType", value);
                  // Fetch bank accounts for the selected collection type
                  fetchBankAccounts(value);
                }}
                disabled={isLoadingOfferingTypes}
              >
                <SelectTrigger className="w-full border-2">
                  <SelectValue placeholder={
                    isLoadingOfferingTypes 
                      ? "Loading offering types..." 
                      : "Please select a value"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {offeringTypes.map((offeringType) => (
                    <SelectItem key={offeringType.id} value={offeringType.id}>
                      {offeringType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOfferingType && (
              <div className="space-y-6 mt-8">
                {isLoadingBankAccounts ? (
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#52024F] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Loading bank accounts...</span>
                    </div>
                  </div>
                ) : bankAccounts.length > 0 ? (
                  bankAccounts.map((account, index) => (
                    <div key={account.id} className="space-y-2">
                      <p className="text-gray-600">
                        <span className="text-gray-800">Bank : </span>
                        <span className="text-[#52024F] font-semibold">
                          {account.bankName}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="text-gray-800">Account Name : </span>
                        <span className="text-[#52024F] font-semibold">
                          {account.accountName}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="text-gray-800">Account Number : </span>
                        <span className="text-[#52024F] font-semibold">
                          {account.accountNumber}
                        </span>
                      </p>
                      {account.currency && (
                        <p className="text-gray-600">
                          <span className="text-gray-800">Currency : </span>
                          <span className="text-[#52024F] font-semibold">
                            {account.currency}
                          </span>
                        </p>
                      )}
                      {account.swiftCode && (
                        <p className="text-gray-600">
                          <span className="text-gray-800">Swift Code : </span>
                          <span className="text-[#52024F] font-semibold">
                            {account.swiftCode}
                          </span>
                        </p>
                      )}
                      {index < bankAccounts.length - 1 && (
                        <div className="border-b border-gray-200 my-4"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bank accounts found for this offering type.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {selectedPayment === "bank-transfer" && (
        <>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Select from the option below to view details
            </p>

            <div>
              <Select
                onValueChange={(value) => {
                  setSelectedOfferingType(value);
                  onInputChange("offeringType", value);
                  // Fetch bank accounts for the selected collection type
                fetchInternationalBankAccounts(value);
                }}
                disabled={isLoadingOfferingTypes}
              >
                <SelectTrigger className="w-full border-2">
                  <SelectValue placeholder={
                    isLoadingOfferingTypes 
                      ? "Loading offering types..." 
                      : "Please select a value"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {offeringTypes.map((offeringType) => (
                    <SelectItem key={offeringType.id} value={offeringType.id}>
                      {offeringType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOfferingType && (
              <div className="space-y-6 mt-8">
                {isLoadingBankAccounts ? (
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#52024F] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Loading bank accounts...</span>
                    </div>
                  </div>
                ) : bankAccounts.length > 0 ? (
                  bankAccounts.map((account, index) => (
                    <div key={account.id} className="space-y-2">
                      <p className="text-gray-600">
                        <span className="text-gray-800">Bank : </span>
                        <span className="text-[#52024F] font-semibold">
                          {account.bankName}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="text-gray-800">Account Name : </span>
                        <span className="text-[#52024F] font-semibold">
                          {account.accountName}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="text-gray-800">Account Number : </span>
                        <span className="text-[#52024F] font-semibold">
                          {account.accountNumber}
                        </span>
                      </p>
                      {account.currency && (
                        <p className="text-gray-600">
                          <span className="text-gray-800">Currency : </span>
                          <span className="text-[#52024F] font-semibold">
                            {account.currency}
                          </span>
                        </p>
                      )}
                      {account.swiftCode && (
                        <p className="text-gray-600">
                          <span className="text-gray-800">Swift Code : </span>
                          <span className="text-[#52024F] font-semibold">
                            {account.swiftCode}
                          </span>
                        </p>
                      )}
                      {index < bankAccounts.length - 1 && (
                        <div className="border-b border-gray-200 my-4"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bank accounts found for this offering type.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {selectedPayment === "churchpad" && (
        <>
          <div className="mt-12 pt-5">
            <p>
              PAYAZA offers some of the most convenient payment methods in USD
              or GBP. Please use any of the options below :
            </p>

            <div className="pt-10 border-b border-gray-200">
              <p className="text-center mb-1">Option 1</p>
            </div>

            <div>
              <p className="mt-5 text-center">Scan the QR Code below and follow the link</p>
              <div className="flex justify-center mt-6">
                <Image
                  src="/qr_code.png"
                  alt="QR Code for Payaza payment"
                  width={200}
                  height={200}
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>

             <div className="pt-10 border-b border-gray-200">
              <p className="text-center mb-1">Option 2</p>
            </div>
          <p className="text-center mb-2 mt-5">Click the button below to visit the PAYAZA Page</p>
          <div className="flex justify-center mt-4">
            <Button 
              type="button"
              onClick={() => window.open('https://business.payaza.africa/pay/livingfaithchurch-youthalive', '_blank')}
              className="px-6 py-5"
            >
              Visit the Winners Page on PAYAZA
            </Button>
          </div>
          </div>
        </>
      )}

      {/* <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold">
        {selectedPayment === "ussd" && "GENERATE USSD CODE"}
        {selectedPayment === "bank-transfer" && "CONFIRM TRANSFER"}
        {selectedPayment === "churchpad" && "PROCEED TO CHURCHPAD"}
      </Button> */}
    </form>
  );
}
