import Razorpay from 'razorpay';

// Lazy-loaded Razorpay instance
let razorpayInstance: Razorpay | null = null;

// Function to get Razorpay instance with lazy initialization
export const getRazorpayInstance = (): Razorpay => {
  // Only initialize on server-side and when environment variables are available
  if (typeof window === 'undefined') {
    if (!razorpayInstance) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!keyId || !keySecret) {
        throw new Error('Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
      }
      
      razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
    return razorpayInstance;
  }
  
  throw new Error('Razorpay instance should only be used on server-side');
};

// For backward compatibility, export null razorpay
export const razorpay = null;

// Types for Razorpay
export interface RazorpayOrderOptions {
  amount: number; // amount in smallest currency unit (paise for INR)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface UPIPaymentOptions {
  vpa: string; // Virtual Payment Address (UPI ID)
  amount: number;
  currency: string;
  description: string;
}

// UPI validation
export const validateUPI = (upiId: string): boolean => {
  const upiRegex = /^[a-zA-Z0-9\.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return upiRegex.test(upiId);
};

// Payment method configurations
export const PAYMENT_METHODS = {
  CARD: 'card',
  UPI: 'upi',
  NETBANKING: 'netbanking',
  WALLET: 'wallet',
} as const;

export const UPI_APPS = [
  { id: 'phonepe', name: 'PhonePe', icon: '📱' },
  { id: 'paytm', name: 'Paytm', icon: '💳' },
  { id: 'googlepay', name: 'Google Pay', icon: '🅖' },
  { id: 'bhim', name: 'BHIM UPI', icon: '🏛️' },
  { id: 'amazonpay', name: 'Amazon Pay', icon: '📦' },
  { id: 'mobikwik', name: 'MobiKwik', icon: '🦋' },
] as const;