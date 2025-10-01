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
import MomoPaymentStatus from "./momo-payment-status";
import PayazaCheckout from "payaza-web-sdk";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import toast from "react-hot-toast";
import { sanitizeInput, validateAndSanitizeFormData } from "@/lib/sanitization";
import apiClient from "@/lib/api-client";

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
  customerBankCode?: string;
  customerPhoneNumber?: string;
  currencyCode?: string;
  phoneCountryCode?: string;
  [key: string]: string | undefined;
}

interface GiverFormProps {
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

// Removed unused momoCurrencies array - using uniqueMomoCurrencies instead

// Create unique currency options for display
const uniqueMomoCurrencies = [
  { code: "GHS", name: "Ghana Cedi", country: "Ghana" },
  // { code: "KES", name: "Kenya Shilling", country: "Kenya" },
  // { code: "XOF", name: "West African CFA Franc", country: "Benin" },
  { code: "XAF", name: "Central African CFA Franc", country: "Cameroon", displayCode: "XAF" },
  // { code: "XOF-COTEDIVOIRE", name: "Central African CFA Franc", country: "Cote d'Ivoire", displayCode: "XAF" },
  { code: "UGX", name: "Uganda Shilling", country: "Uganda" },
  { code: "TZS", name: "Tanzania Shilling", country: "Tanzania" },
  { code: "SLE", name: "Sierra Leone Leone", country: "Sierra Leone" },
];

// Bank codes for different countries
interface BankCode {
  name: string;
  code: string;
}

const momoBankCodes: Record<string, BankCode[]> = {
  GHS: [
    { name: "MTN MOBILE MONEY", code: "MTN" },
    { name: "VODAFONE CASH", code: "VOD" },
    { name: "AIRTELTIGO MONEY", code: "AIR" },
  ],
  KES: [
    { name: "SAFARICOM", code: "SAFKEN" },
  ],
  "XAF": [
    { name: "MTN", code: "MTNCMR" },
    { name: "Orange", code: "ORACMR" },
  ],
  XOF: [
    { name: "MOOV", code: "MOOBEN" },
    { name: "MTN", code: "MTNBEN" },
  ],
  "XAF-COTEDIVOIRE": [
    { name: "MTN", code: "MOMCIV" },
    { name: "ORANGE", code: "MOMCIV" },
    { name: "MOOV", code: "MOMCIV" },
    { name: "WAVE", code: "WAVCIV" },
  ],
  UGX: [
    { name: "MTN MOBILE MONEY", code: "MTNUGA" },
    { name: "AIRTEL", code: "AIRUGA" },
  ],
  TZS: [
    { name: "TIGO", code: "TIGTZA" },
    { name: "AIRTEL", code: "AIRTZA" },
    { name: "HALOTEL", code: "HALTZA" },
  ],
  SLE: [
    { name: "ORANGE", code: "ORASLE" },
  ],
};

export default function PaymentForm({
  selectedPayment,
  selectedSupport,
  formData,
  onInputChange,
  onSubmit,
  onSupportBack,
}: GiverFormProps) {
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

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Success screen state
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successData, setSuccessData] = useState<{
    donorName: string;
    transactionReference: string;
    amount: string;
    currency: string;
    offeringType: string;
  } | null>(null);

  // MOMO payment status screen state
  const [showMomoStatusScreen, setShowMomoStatusScreen] = useState(false);
  const [momoStatusData, setMomoStatusData] = useState<{
    collectionNo: string;
    transactionReference: string;
    amount: string;
    currency: string;
    donorName: string;
    offeringType: string;
    phoneNumber: string;
  } | null>(null);

  // Fetch offering types from API
  const fetchOfferingTypes = useCallback(async () => {
    try {
      setIsLoadingOfferingTypes(true);
      const response = await apiClient.get<OfferingType[]>('collection-types');
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
      const response = await apiClient.get<BankAccount[]>(
        `bank-account/local?pageNumber=0&pageSize=100&collectionTypeId=${collectionTypeId}`
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
      const response = await apiClient.get<BankAccount[]>(
        `bank-account/international?pageNumber=0&pageSize=100&collectionTypeId=${collectionTypeId}`
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
  const handleCollectionComplete = useCallback(async (collectionNo: string, reference: string) => {
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

      const completionPromise = apiClient.put('collections/complete', {
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
          offeringType: formData.offeringType || "giver",
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
  }, [formData, isCompletingCollection]);

  // Handle Momo payment
  const handleMomoPayment = useCallback(async () => {
    try {
      // Validate and sanitize form data first
      const sanitizedFormData = validateAndSanitizeFormData(formData);
      
      // Validate Momo-specific fields
      if (!sanitizedFormData.customerPhoneNumber || !sanitizedFormData.customerBankCode || !sanitizedFormData.currencyCode) {
        toast.error("Please fill in all required fields (phone number, bank code, currency)");
        return;
      }

      if (!sanitizedFormData.email || !sanitizedFormData.amount || !sanitizedFormData.offeringType || !sanitizedFormData.firstName || !sanitizedFormData.lastName) {
        toast.error("Please fill in all required fields");
        return;
      }

      setIsProcessingPayment(true);

      // Generate unique reference
      const reference = `MOMO_${uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase()}`;

      // Get country code from currency mapping
      const getCountryCode = (currency: string, country?: string) => {
        const countryMapping: Record<string, string> = {
          'GHS': 'GH',
          'KES': 'KE', 
          'XOF': country === 'Republic of Benin' ? 'BJ' : 'CI', // Benin or Cote d'Ivoire
          'UGX': 'UG',
          'TZS': 'TZ',
          'SLE': 'SL',
          'XAF': country === 'Cameroon' ? 'CM' : 'CI' // Cameroon or Cote d'Ivoire
        };
        return countryMapping[currency] || '';
      };

      // Create collection record via API (same as Payaza flow)
      const phoneCountryCode = sanitizedFormData.phoneCountryCode || "+234";
      // For MOMO, remove the plus sign from the country code and combine with phone number
      const countryCodeWithoutPlus = phoneCountryCode.replace('+', '');
      const fullPhoneNumber = `${countryCodeWithoutPlus}${sanitizedFormData.customerPhoneNumber}`;
      
      const collectionPayload = {
        paymentGateway: "MOMO_PSB",
        currency: sanitizedFormData.currencyCode || sanitizedFormData.currency,
        amount: parseFloat(sanitizedFormData.amount),
        collectionTypeId: sanitizedFormData.offeringType,
        collectionReference: reference,
        firstName: sanitizedFormData.firstName,
        lastName: sanitizedFormData.lastName,
        email: sanitizedFormData.email,
        phoneNumber: fullPhoneNumber,
        customerNumber: fullPhoneNumber,
        comment: sanitizedFormData.comment || "Testing",
        customerBankCode: sanitizedFormData.customerBankCode,
        countryCode: getCountryCode(sanitizedFormData.currencyCode || sanitizedFormData.currency, sanitizedFormData.country || ''),
        phoneCountryCode: phoneCountryCode
      };

      console.log("Momo collection payload:", collectionPayload);

      const collectionResponse = await apiClient.post('collections', collectionPayload);
      const { collectionNo } = collectionResponse.data;
      
      console.log("Momo collection response:", collectionResponse.data);

      // Save collectionNo to localStorage for later use
      localStorage.setItem('currentCollectionNo', collectionNo);
      localStorage.setItem('currentCollectionReference', reference);

      // Show MOMO status screen instead of completing immediately
      setMomoStatusData({
        collectionNo,
        transactionReference: reference,
        amount: sanitizedFormData.amount,
        currency: (sanitizedFormData.currencyCode || sanitizedFormData.currency) as string,
        donorName: `${sanitizedFormData.firstName} ${sanitizedFormData.lastName}`,
        offeringType: sanitizedFormData.offeringType || "giver",
        phoneNumber: sanitizedFormData.customerPhoneNumber || "",
      });
      
      setShowMomoStatusScreen(true);
      setIsProcessingPayment(false);
      
      toast.success("Mobile money payment initiated! Please complete on your device.");

    } catch (error) {
      console.error("Error processing Momo payment:", error);
      
      // Handle specific error responses
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || "Payment failed";
        toast.error(`Momo payment failed: ${errorMessage}`);
      } else if (error instanceof Error) {
        toast.error(`Validation error: ${error.message}`);
      } else {
        toast.error("Failed to process Momo payment. Please try again.");
      }
      
      setIsProcessingPayment(false);
    }
  }, [formData]);  // Handle Payaza payment
  const handlePayazaPayment = useCallback(async () => {
    try {
      // Validate and sanitize form data first
      const sanitizedFormData = validateAndSanitizeFormData(formData);
      
      if (!sanitizedFormData.email || !sanitizedFormData.amount || !sanitizedFormData.currency || !sanitizedFormData.offeringType) {
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

      setIsProcessingPayment(true);
      setLastProcessedReference(null); // Reset for new payment
      await loadPayazaSDK();

      // Generate unique reference with 8-character UUID
      const reference = `${uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase()}`;

      // First, create collection record via API
      const phoneCountryCode = sanitizedFormData.phoneCountryCode || "+234";
      const fullPhoneNumber = sanitizedFormData.phone ? `${phoneCountryCode}${sanitizedFormData.phone}` : '';
      
      const collectionPayload = {
        paymentGateway: "PAYAZA",
        currency: sanitizedFormData.currency.toUpperCase(),
        amount: parseFloat(sanitizedFormData.amount),
        collectionTypeId: sanitizedFormData.offeringType,
        collectionReference: reference,
        firstName: sanitizedFormData.firstName || '',
        lastName: sanitizedFormData.lastName || '',
        email: sanitizedFormData.email,
        phoneNumber: fullPhoneNumber,
        comment: sanitizedFormData.comment || "",
        phoneCountryCode: phoneCountryCode
      };

      const collectionResponse = await apiClient.post('collections', collectionPayload);
      const { collectionNo } = collectionResponse.data;
      
      // Save collectionNo to localStorage for later use
      localStorage.setItem('currentCollectionNo', collectionNo);
      localStorage.setItem('currentCollectionReference', reference);

      const config = {
        merchant_key: merchantKey,
        email_address: sanitizedFormData.email,
        checkout_amount: parseFloat(sanitizedFormData.amount),
        currency: sanitizedFormData.currency.toUpperCase(),
        transaction_reference: reference,
        first_name: sanitizedFormData.firstName || '',
        last_name: sanitizedFormData.lastName || '',
        phone_number: fullPhoneNumber,
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
            handleCollectionComplete(collectionNo, reference);
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
      
      if (error instanceof Error) {
        toast.error(`Validation error: ${error.message}`);
      } else {
        toast.error("Failed to initialize payment. Please try again.");
      }
      
      setIsProcessingPayment(false);
      
      // Clean up localStorage if collection creation failed
      localStorage.removeItem('currentCollectionNo');
      localStorage.removeItem('currentCollectionReference');
    }
  }, [formData, loadPayazaSDK, handleCollectionComplete, lastProcessedReference]);

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
    // Clear Momo-specific fields
    onInputChange("customerBankCode", "");
    onInputChange("customerPhoneNumber", "");
    onInputChange("currencyCode", "");
    onInputChange("phoneCountryCode", "");
  }, [formData, onInputChange]);



  // Handle MOMO payment completion - show transaction table
  const handleMomoPaymentCompleted = useCallback(() => {
    setShowMomoStatusScreen(false);
    setMomoStatusData(null);
    
    // Show success screen with transaction table link
    if (momoStatusData) {
      setSuccessData({
        donorName: momoStatusData.donorName,
        transactionReference: momoStatusData.transactionReference,
        amount: momoStatusData.amount,
        currency: momoStatusData.currency,
        offeringType: momoStatusData.offeringType,
      });
      setShowSuccessScreen(true);
    }
  }, [momoStatusData]);

  // Handle back to form from MOMO status screen
  const handleBackToFormFromMomo = useCallback(() => {
    setShowMomoStatusScreen(false);
    setMomoStatusData(null);
    setIsProcessingPayment(false);
    setSelectedProvider(null);
    
    // Clear localStorage
    localStorage.removeItem('currentCollectionNo');
    localStorage.removeItem('currentCollectionReference');
  }, []);

  // Check if Momo provider is selected
  const isMomoSelected = selectedProvider === "momo";

  // Phone number validation by country
  const validatePhoneNumberByCountry = useCallback((phoneNumber: string, countryCode: string): { error?: string } => {
    // Remove any leading zeros or plus signs from the phone number
    const cleanNumber = phoneNumber.replace(/^[0+]+/, '');
    
    // Country-specific validation rules
    const countryRules: Record<string, { minLength: number; maxLength: number; pattern?: RegExp; description: string }> = {
      "+234": { minLength: 10, maxLength: 10, pattern: /^[789]\d{9}$/, description: "Nigerian number (10 digits, starts with 7, 8, or 9)" },
      "+233": { minLength: 9, maxLength: 9, pattern: /^[2-9]\d{8}$/, description: "Ghanaian number (9 digits)" },
      "+254": { minLength: 9, maxLength: 9, pattern: /^[17]\d{8}$/, description: "Kenyan number (9 digits, starts with 1 or 7)" },
      "+229": { minLength: 8, maxLength: 8, pattern: /^[0-9]\d{7}$/, description: "Benin number (8 digits)" },
      "+237": { minLength: 8, maxLength: 9, pattern: /^[26]\d{7,8}$/, description: "Cameroon number (8-9 digits, starts with 2 or 6)" },
      "+225": { minLength: 8, maxLength: 8, pattern: /^[0-9]\d{7}$/, description: "Cote d'Ivoire number (8 digits)" },
      "+256": { minLength: 9, maxLength: 9, pattern: /^[37]\d{8}$/, description: "Uganda number (9 digits, starts with 3 or 7)" },
      "+255": { minLength: 9, maxLength: 9, pattern: /^[67]\d{8}$/, description: "Tanzania number (9 digits, starts with 6 or 7)" },
      "+232": { minLength: 8, maxLength: 8, pattern: /^[2-9]\d{7}$/, description: "Sierra Leone number (8 digits)" },
      "+1": { minLength: 10, maxLength: 10, pattern: /^[2-9]\d{9}$/, description: "US/Canada number (10 digits)" },
      "+44": { minLength: 10, maxLength: 10, pattern: /^[17]\d{9}$/, description: "UK number (10 digits)" },
      "+27": { minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/, description: "South Africa number (9 digits)" },
    };

    const rule = countryRules[countryCode];
    if (!rule) {
      // Generic validation for unknown country codes
      if (!/^\d+$/.test(cleanNumber)) {
        return { error: 'Phone number must contain only digits' };
      }
      if (cleanNumber.length < 7 || cleanNumber.length > 15) {
        return { error: 'Phone number must be between 7 and 15 digits' };
      }
      return {};
    }

    // Check if phone number contains only digits
    if (!/^\d+$/.test(cleanNumber)) {
      return { error: 'Phone number must contain only digits' };
    }

    // Check length
    if (cleanNumber.length < rule.minLength) {
      return { error: `Phone number too short. Expected ${rule.minLength} digits for ${rule.description}` };
    }
    if (cleanNumber.length > rule.maxLength) {
      return { error: `Phone number too long. Expected ${rule.maxLength} digits for ${rule.description}` };
    }

    // Check pattern if specified
    if (rule.pattern && !rule.pattern.test(cleanNumber)) {
      return { error: `Invalid phone number format for ${rule.description}` };
    }

    return {};
  }, []);

  // Field validation functions
  const validateField = useCallback((field: string, value: string): string => {
    const trimmedValue = value?.trim() || '';
    
    switch (field) {
      case 'email':
        if (!trimmedValue) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue)) return 'Please enter a valid email address';
        return '';
        
      case 'firstName':
        if (!trimmedValue) return 'First name is required';
        if (trimmedValue.length < 2) return 'First name must be at least 2 characters';
        return '';
        
      case 'lastName':
        if (!trimmedValue) return 'Last name is required';
        if (trimmedValue.length < 2) return 'Last name must be at least 2 characters';
        return '';
        
      case 'amount':
        if (!trimmedValue) return 'Amount is required';
        const amount = parseFloat(trimmedValue);
        if (isNaN(amount) || amount <= 0) return 'Please enter a valid amount';
        if (amount < 1) return 'Minimum amount is 1';
        return '';
        
      case 'currency':
        if (!trimmedValue) return 'Currency is required';
        return '';
        
      case 'offeringType':
        if (!trimmedValue) return 'Offering type is required';
        return '';
        
      case 'phone':
      case 'customerPhoneNumber':
        if (!trimmedValue) return 'Phone number is required';
        
        // Get the current country code from form data
        const countryCode = formData.phoneCountryCode || "+234";
        const cleanedPhone = trimmedValue.replace(/[\s\-()]/g, ''); // Remove spaces, dashes, parentheses
        
        // Validate phone number format and length based on country code
        const phoneValidation = validatePhoneNumberByCountry(cleanedPhone, countryCode);
        if (phoneValidation.error) return phoneValidation.error;
        
        return '';
        
      case 'customerBankCode':
        if (isMomoSelected && !trimmedValue) return 'Mobile money provider is required';
        return '';
        
      default:
        return '';
    }
  }, [isMomoSelected, formData.phoneCountryCode, validatePhoneNumberByCountry]);

  // Sanitized input change handler with validation
  const handleSanitizedInputChange = useCallback((field: string, value: string) => {
    try {
      const sanitizedValue = sanitizeInput(value);
      onInputChange(field, sanitizedValue);
      
      // Validate field and update errors
      const error = validateField(field, sanitizedValue);
      setFieldErrors(prev => ({
        ...prev,
        [field]: error
      }));
    } catch (error) {
      console.error('Input sanitization error:', error);
      toast.error('Invalid input detected. Please check your data.');
    }
  }, [onInputChange, validateField]);

  // Handle form submission
  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      try {
        // Validate and sanitize form data before processing
        const sanitizedFormData = validateAndSanitizeFormData(formData);
        
        // For card payments, ensure a provider is selected
        if (selectedPayment === "card" && !selectedProvider) {
          toast.error("Please select a payment provider (Payaza or MOMO PSB)");
          return;
        }

        // Update formData with sanitized version for processing
        Object.keys(sanitizedFormData).forEach((key) => {
          if (sanitizedFormData[key as keyof FormData] !== formData[key as keyof FormData]) {
            onInputChange(key, sanitizedFormData[key as keyof FormData] as string);
          }
        });

        if (selectedProvider === "payaza") {
          handlePayazaPayment();
        } else if (selectedProvider === "momo") {
          handleMomoPayment();
        } else {
          // Default form submission for other payment methods
          onSubmit(e);
        }
      } catch (error) {
        console.error('Form validation error:', error);
        toast.error(error instanceof Error ? error.message : 'Invalid form data. Please check your inputs.');
      }
    },
    [selectedPayment, selectedProvider, handlePayazaPayment, handleMomoPayment, onSubmit, formData, onInputChange]
  );

  if (selectedSupport) {
    return <SupportForms selectedSupport={selectedSupport} onBack={onSupportBack} />;
  }

  // Show MOMO payment status screen
  if (showMomoStatusScreen && momoStatusData) {
    return (
      <MomoPaymentStatus
        collectionNo={momoStatusData.collectionNo}
        transactionReference={momoStatusData.transactionReference}
        amount={momoStatusData.amount}
        currency={momoStatusData.currency}
        donorName={momoStatusData.donorName}
        offeringType={momoStatusData.offeringType}
        phoneNumber={momoStatusData.phoneNumber}
        onPaymentCompleted={handleMomoPaymentCompleted}
        onBackToForm={handleBackToFormFromMomo}
      />
    );
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

  // Get bank codes for selected currency
  const getBankCodesForCurrency = (currency: string) => {
    // Handle XAF based on country
    if (currency === "XAF") {
      if (formData.country === "Cote d'Ivoire") {
        return momoBankCodes["XAF-COTEDIVOIRE"] || [];
      } else if (formData.country === "Cameroon") {
        return momoBankCodes["XAF-CAMEROON"] || [];
      }
    }
    return momoBankCodes[currency as keyof typeof momoBankCodes] || [];
  };

  // Get country codes based on selected currency for Momo
  const getCountryCodesForCurrency = (currency: string) => {
    const currencyToCountryCode: Record<string, { code: string; country: string }[]> = {
      GHS: [{ code: "+233", country: "Ghana" }],
      KES: [{ code: "+254", country: "Kenya" }],
      XOF: [{ code: "+229", country: "Benin" }],
      XAF: [
        { code: "+237", country: "Cameroon" },
        { code: "+225", country: "Cote d'Ivoire" }
      ],
      UGX: [{ code: "+256", country: "Uganda" }],
      TZS: [{ code: "+255", country: "Tanzania" }],
      SLE: [{ code: "+232", country: "Sierra Leone" }],
    };
    
    return currencyToCountryCode[currency] || [];
  };

  // Get all country codes for non-Momo payments
  const getAllCountryCodes = () => [
    { code: "+234", country: "Nigeria" },
    { code: "+233", country: "Ghana" },
    { code: "+254", country: "Kenya" },
    { code: "+229", country: "Benin" },
    { code: "+237", country: "Cameroon" },
    { code: "+225", country: "Cote d'Ivoire" },
    { code: "+256", country: "Uganda" },
    { code: "+255", country: "Tanzania" },
    { code: "+232", country: "Sierra Leone" },
    { code: "+1", country: "US/Canada" },
    { code: "+44", country: "UK" },
    { code: "+27", country: "South Africa" },
  ];

  // Get appropriate country codes based on selection
  const availableCountryCodes = isMomoSelected && formData.currency 
    ? getCountryCodesForCurrency(formData.currency)
    : getAllCountryCodes();

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {selectedPayment === "card" && "Pay with Card"}
        {selectedPayment === "local-bank-transfer" && "Bank Transfer"}
        {selectedPayment === "bank-transfer" && "Bank Transfer Giver"}
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
                onValueChange={(value) => {
                  if (isMomoSelected) {
                    // For Momo, handle special XAF cases
                    if (value === "XAF-CAMEROON") {
                      onInputChange("currency", "XAF");
                      onInputChange("currencyCode", "XAF");
                      onInputChange("country", "Cameroon");
                      onInputChange("phoneCountryCode", "+237"); // Cameroon country code
                    } else if (value === "XAF-COTEDIVOIRE") {
                      onInputChange("currency", "XAF");
                      onInputChange("currencyCode", "XAF");
                      onInputChange("country", "Cote d'Ivoire");
                      onInputChange("phoneCountryCode", "+225"); // Cote d'Ivoire country code
                    } else {
                      onInputChange("currency", value);
                      onInputChange("currencyCode", value);
                      const currency = uniqueMomoCurrencies.find(c => c.code === value);
                      if (currency) {
                        onInputChange("country", currency.country);
                        // Set appropriate country code based on currency
                        const countryCodes = getCountryCodesForCurrency(value);
                        if (countryCodes.length > 0) {
                          onInputChange("phoneCountryCode", countryCodes[0].code);
                        }
                      }
                    }
                    // Clear bank code when currency changes
                    onInputChange("customerBankCode", "");
                  } else {
                    onInputChange("currency", value);
                  }
                  
                  // Clear error when value is selected
                  setFieldErrors(prev => ({
                    ...prev,
                    currency: ''
                  }));
                }}
              >
                <SelectTrigger className={`w-full ${fieldErrors.currency ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {isMomoSelected ? (
                    // Show Momo currencies
                    uniqueMomoCurrencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.displayCode || currency.code} - {currency.name} ({currency.country})
                      </SelectItem>
                    ))
                  ) : (
                    // Show Payaza currencies
                    <>
                      <SelectItem value="ngn">NGN - Nigerian Naira</SelectItem>
                      <SelectItem value="usd">USD - US Dollar</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {fieldErrors.currency && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.currency}</p>
              )}
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
                onChange={(e) => handleSanitizedInputChange("amount", e.target.value)}
                className={fieldErrors.amount ? 'border-red-500' : ''}
                required
              />
              {fieldErrors.amount && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.amount}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="offering-type" className="text-gray-600 mb-2 block">
              Offering Type
            </Label>
            <Select
              onValueChange={(value) => {
                onInputChange("offeringType", value);
                // Clear error when value is selected
                setFieldErrors(prev => ({
                  ...prev,
                  offeringType: ''
                }));
              }}
              disabled={isLoadingOfferingTypes}
            >
              <SelectTrigger className={`w-full z-99 ${fieldErrors.offeringType ? 'border-red-500' : ''}`}>
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
            {fieldErrors.offeringType && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.offeringType}</p>
            )}
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
                onChange={(e) => handleSanitizedInputChange("firstName", e.target.value)}
                className={fieldErrors.firstName ? 'border-red-500' : ''}
                required
              />
              {fieldErrors.firstName && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.firstName}</p>
              )}
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
                onChange={(e) => handleSanitizedInputChange("lastName", e.target.value)}
                className={fieldErrors.lastName ? 'border-red-500' : ''}
                required
              />
              {fieldErrors.lastName && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-gray-600 mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your email here"
                value={formData.email}
                onChange={(e) => handleSanitizedInputChange("email", e.target.value)}
                className={fieldErrors.email ? 'border-red-500' : ''}
                required
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-600 mb-2 block">
                {isMomoSelected ? "Customer Phone Number" : "Phone"}
              </Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.phoneCountryCode || (availableCountryCodes.length > 0 ? availableCountryCodes[0].code : "+234")}
                  onValueChange={(value) => {
                    onInputChange("phoneCountryCode", value);
                    // Revalidate phone number when country code changes
                    const phoneField = isMomoSelected ? "customerPhoneNumber" : "phone";
                    const phoneValue = isMomoSelected ? formData.customerPhoneNumber : formData.phone;
                    if (phoneValue) {
                      const error = validateField(phoneField, phoneValue);
                      setFieldErrors(prev => ({
                        ...prev,
                        [phoneField]: error
                      }));
                    }
                  }}
                >
                  <SelectTrigger className="w-20 sm:w-24 z-10 flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCountryCodes.map((countryCode) => (
                      <SelectItem key={countryCode.code} value={countryCode.code}>
                        {countryCode.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="123 4567 890"
                  className={`flex-1 min-w-0 ${fieldErrors.phone || fieldErrors.customerPhoneNumber ? 'border-red-500' : ''}`}
                  value={isMomoSelected ? formData.customerPhoneNumber || "" : formData.phone}
                  onChange={(e) => 
                    isMomoSelected 
                      ? handleSanitizedInputChange("customerPhoneNumber", e.target.value)
                      : handleSanitizedInputChange("phone", e.target.value)
                  }
                  required
                />
              </div>
              {(fieldErrors.phone || fieldErrors.customerPhoneNumber) && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.phone || fieldErrors.customerPhoneNumber}
                </p>
              )}
            </div>
          </div>

          {/* Customer Bank Code field - only show for Momo */}
          {isMomoSelected && formData.currency && (
            <div>
              <Label htmlFor="customerBankCode" className="text-gray-600 mb-2 block">
                Customer Bank Code
              </Label>
              <Select
                onValueChange={(value) => {
                  onInputChange("customerBankCode", value);
                  // Clear error when value is selected
                  setFieldErrors(prev => ({
                    ...prev,
                    customerBankCode: ''
                  }));
                }}
                value={formData.customerBankCode || ""}
              >
                <SelectTrigger className={`w-full ${fieldErrors.customerBankCode ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select Mobile Money Provider" />
                </SelectTrigger>
                <SelectContent>
                  {getBankCodesForCurrency(formData.currency).map((bank: BankCode) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name} - {bank.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.customerBankCode && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.customerBankCode}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="comment" className="text-gray-600 mb-2 block">
              Comment
            </Label>
            <Textarea
              id="comment"
              placeholder="What is the offering for?"
              rows={4}
              value={formData.comment}
              onChange={(e) => handleSanitizedInputChange("comment", e.target.value)}
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
                  <p className="font-medium">Finalizing your gift...</p>
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
