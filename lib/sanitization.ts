/**
 * DOM Sanitization Utilities
 * Provides client-side and server-side sanitization for user inputs
 */

import DOMPurify from "dompurify";

// Form data interface for type safety
export interface SanitizableFormData {
  [key: string]: string | undefined;
}

/**
 * Sanitizes a single input string
 * @param input - The input string to sanitize
 * @returns Sanitized string safe for DOM insertion
 */
export const sanitizeInput = (input: string): string => {
  if (typeof window !== 'undefined') {
    // Client-side sanitization using DOMPurify
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true 
    });
  }
  // Server-side fallback - basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns Boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format
 * @param phone - Phone number string to validate
 * @returns Boolean indicating if phone number is valid
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone);
};

/**
 * Validates amount is within acceptable range
 * @param amount - Amount string to validate
 * @returns Boolean indicating if amount is valid
 */
export const validateAmount = (amount: string): boolean => {
  const numericAmount = parseFloat(amount);
  return !isNaN(numericAmount) && numericAmount > 0 && numericAmount <= 1000000;
};

/**
 * Validates and sanitizes form data with comprehensive checks
 * @param formData - Form data object to validate and sanitize
 * @returns Sanitized form data object
 * @throws Error if validation fails
 */
export const validateAndSanitizeFormData = <T extends SanitizableFormData>(formData: T): T => {
  const sanitizedData = { ...formData } as T;
  
  // Sanitize string fields
  const stringFields = Object.keys(formData);
  
  stringFields.forEach(field => {
    if (sanitizedData[field] && typeof sanitizedData[field] === 'string') {
      (sanitizedData as Record<string, string | undefined>)[field] = sanitizeInput(sanitizedData[field] as string);
    }
  });
  
  // Additional validation for specific fields
  if (sanitizedData.email && !validateEmail(sanitizedData.email)) {
    throw new Error('Invalid email format');
  }
  
  if (sanitizedData.amount && !validateAmount(sanitizedData.amount)) {
    throw new Error('Invalid amount. Amount must be between 0 and 1,000,000');
  }
  
  if (sanitizedData.phone && !validatePhone(sanitizedData.phone)) {
    throw new Error('Invalid phone number format');
  }
  
  if (sanitizedData.customerPhoneNumber && !validatePhone(sanitizedData.customerPhoneNumber)) {
    throw new Error('Invalid customer phone number format');
  }
  
  return sanitizedData;
};

/**
 * Content Security Policy configuration recommendations
 * Add these headers to your Next.js configuration
 */
export const CSP_RECOMMENDATIONS = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline' 'unsafe-eval' https://checkout.payaza.africa",
  'style-src': "'self' 'unsafe-inline'",
  'img-src': "'self' data: https:",
  'connect-src': "'self' https://api.payaza.africa https://checkout.payaza.africa",
  'frame-src': "'self' https://checkout.payaza.africa",
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'"
};

/**
 * Rate limiting configuration for form submissions
 */
export const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many payment attempts. Please try again later.'
};
