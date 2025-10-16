"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// UPI validation function
const validateUPI = (upiId: string): boolean => {
  const upiRegex = /^[a-zA-Z0-9\.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return upiRegex.test(upiId);
};

// UPI apps configuration
const UPI_APPS = [
  { id: 'phonepe', name: 'PhonePe', icon: '📱' },
  { id: 'paytm', name: 'Paytm', icon: '💳' },
  { id: 'googlepay', name: 'Google Pay', icon: '🅖' },
  { id: 'bhim', name: 'BHIM UPI', icon: '🏛️' },
  { id: 'amazonpay', name: 'Amazon Pay', icon: '📦' },
  { id: 'mobikwik', name: 'MobiKwik', icon: '🦋' },
] as const;

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  method: {
    upi?: boolean;
    card?: boolean;
    netbanking?: boolean;
    wallet?: boolean;
  };
}
import { 
  ArrowLeft, 
  CreditCard,
  Shield,
  CheckCircle,
  Clock,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  User,
  Mail,
  Phone,
  MapPin,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface BatchDetails {
  id: string;
  name: string;
  description?: string;
  category: "JEE" | "NEET";
  class_type: "11th" | "12th" | "Dropper";
  thumbnail?: string;
  capacity: number;
  current_students: number;
  fees: number;
  status: "active" | "inactive" | "full";
  schedule_days: string[];
  start_time?: string;
  end_time?: string;
  start_date?: string;
  end_date?: string;
  teacher_name?: string;
  created_at: string;
}

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  classType: string;
  examPreference: string;
}

export default function CheckoutPage() {
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<BatchDetails | null>(null);
  const [profileData, setProfileData] = useState<StudentProfile | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  const [billingForm, setBillingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    saveCard: false,
    upiId: '',
    selectedUpiApp: '',
    netbankingBank: ''
  });

  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discount: 0,
    taxes: 0,
    total: 0
  });

  const router = useRouter();
  const params = useParams();
  const batchId = params.batchId as string;
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/student/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (batchId && user) {
      fetchBatchData();
      fetchProfile();
      checkEnrollmentStatus();
    }
  }, [batchId, user]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchBatchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching batch data for ID:', batchId);
      const response = await fetch(`/api/batches/${batchId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch batch data:', errorData);
        throw new Error(errorData.error || 'Failed to fetch batch data');
      }
      
      const data = await response.json();
      console.log('Batch data received:', data);
      setBatch(data.batch);
      
      // Calculate pricing
      const fees = data.batch.fees || 0;
      const discount = 0; // Could be calculated based on promotions
      const taxes = Math.round(fees * 0.18); // 18% GST
      
      setOrderSummary({
        subtotal: fees,
        discount: discount,
        taxes: taxes,
        total: fees + taxes - discount
      });
      
    } catch (error) {
      console.error('Error fetching batch:', error);
      toast.error('Failed to fetch batch data');
      router.push('/student/batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfileData(data);
      
      // Pre-fill billing form
      setBillingForm(prev => ({
        ...prev,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || user?.email || '',
      }));
      
      // Pre-fill payment form
      setPaymentForm(prev => ({
        ...prev,
        cardholderName: `${data.firstName} ${data.lastName}` || ''
      }));
      
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('batch_enrollments')
        .select('*')
        .eq('batch_id', batchId)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (data && !error) {
        setIsEnrolled(true);
        toast.info('You are already enrolled in this batch!');
        router.push(`/student/batches/${batchId}`);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleBillingFormChange = (field: string, value: string) => {
    setBillingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentFormChange = (field: string, value: string | boolean) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateBillingForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone'];
    return required.every(field => billingForm[field as keyof typeof billingForm].trim() !== '');
  };

  const validatePaymentForm = () => {
    if (paymentForm.paymentMethod === 'card') {
      return paymentForm.cardNumber && paymentForm.expiryDate && paymentForm.cvv && paymentForm.cardholderName;
    } else if (paymentForm.paymentMethod === 'upi') {
      return paymentForm.upiId && validateUPI(paymentForm.upiId);
    } else if (paymentForm.paymentMethod === 'netbanking') {
      return paymentForm.netbankingBank !== '';
    }
    return true;
  };

  const processPayment = async () => {
    try {
      setPaymentLoading(true);
      
      // Final validation
      if (!validateBillingForm()) {
        toast.error('Please fill in all required billing details');
        setCurrentStep(1);
        return;
      }

      if (!validatePaymentForm()) {
        toast.error('Please fill in all payment details');
        setCurrentStep(2);
        return;
      }

      // Create Razorpay order
      console.log('Creating payment order with:', {
        batchId: batchId,
        amount: orderSummary.total,
        currency: 'INR',
        billingInfo: billingForm
      });
      
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          batchId: batchId,
          amount: orderSummary.total,
          currency: 'INR',
          billingInfo: billingForm
        })
      });

      if (!orderResponse.ok) {
        let errorData;
        const responseText = await orderResponse.text();
        console.error('Payment order creation failed:', {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          responseText: responseText,
          headers: Object.fromEntries(orderResponse.headers.entries())
        });
        
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { error: `Server returned: ${responseText}` };
        }
        
        if (orderResponse.status === 401) {
          toast.error('Please login to continue with payment');
          router.push('/student/login');
          return;
        }
        
        if (orderResponse.status === 404) {
          toast.error('Batch not found. Redirecting to batches page.');
          router.push('/student/batches');
          return;
        }
        
        if (orderResponse.status === 500) {
          toast.error('Server error. Please try again later.');
          return;
        }
        
        throw new Error(errorData.error || `Payment order failed (${orderResponse.status})`);
      }

      const { orderId, amount, currency, key, paymentRecordId, batch: batchInfo } = await orderResponse.json();

      // Configure Razorpay options
      const razorpayOptions: RazorpayOptions = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'JEE-NEET Prep',
        description: `Enrollment for ${batchInfo.name}`,
        order_id: orderId,
        handler: async (response: any) => {
          // Payment successful, verify on server
          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include', // Include cookies for authentication
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentRecordId: paymentRecordId,
                paymentMethod: paymentForm.paymentMethod
              })
            });

            if (verifyResponse.ok) {
              setCurrentStep(4);
              toast.success('🎉 Payment successful! Welcome to the batch!');
              
              // Redirect after 3 seconds
              setTimeout(() => {
                router.push(`/student/batches/${batchId}`);
              }, 3000);
            } else {
              const errorData = await verifyResponse.json();
              toast.error(errorData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: billingForm.firstName + ' ' + billingForm.lastName,
          email: billingForm.email,
          contact: billingForm.phone
        },
        theme: {
          color: '#2563eb'
        },
        method: {
          upi: paymentForm.paymentMethod === 'upi',
          card: paymentForm.paymentMethod === 'card',
          netbanking: paymentForm.paymentMethod === 'netbanking',
          wallet: paymentForm.paymentMethod === 'wallet'
        }
      };

      // Open Razorpay checkout
      if (window.Razorpay) {
        const razorpay = new window.Razorpay(razorpayOptions);
        
        razorpay.on('payment.failed', (response: any) => {
          console.error('Payment failed:', response.error);
          toast.error(`Payment failed: ${response.error.description || 'Please try again'}`);
        });

        razorpay.open();
      } else {
        throw new Error('Razorpay SDK not loaded');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Batch not found</h2>
          <p className="text-gray-600 mb-4">The batch you're trying to enroll in doesn't exist.</p>
          <Link href="/student/batches">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Batches
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/student/batches/${batchId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Batch
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Checkout</h1>
                <p className="text-sm text-gray-500">Complete your enrollment</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              {[
                { step: 1, label: 'Billing Details', icon: User },
                { step: 2, label: 'Payment Method', icon: CreditCard },
                { step: 3, label: 'Review Order', icon: CheckCircle },
                { step: 4, label: 'Confirmation', icon: GraduationCap }
              ].map(({ step, label, icon: Icon }) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {label}
                  </span>
                  {step < 4 && (
                    <div className={`ml-8 w-16 h-0.5 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Billing Details */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Billing Details
                  </CardTitle>
                  <CardDescription>
                    Enter your billing information for enrollment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={billingForm.firstName}
                        onChange={(e) => handleBillingFormChange('firstName', e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={billingForm.lastName}
                        onChange={(e) => handleBillingFormChange('lastName', e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={billingForm.email}
                        onChange={(e) => handleBillingFormChange('email', e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={billingForm.phone}
                        onChange={(e) => handleBillingFormChange('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Input
                      id="address"
                      value={billingForm.address}
                      onChange={(e) => handleBillingFormChange('address', e.target.value)}
                      placeholder="Street address, apartment, suite, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={billingForm.city}
                        onChange={(e) => handleBillingFormChange('city', e.target.value)}
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={billingForm.state}
                        onChange={(e) => handleBillingFormChange('state', e.target.value)}
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">PIN Code</Label>
                      <Input
                        id="pincode"
                        value={billingForm.pincode}
                        onChange={(e) => handleBillingFormChange('pincode', e.target.value)}
                        placeholder="400001"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setCurrentStep(2)}
                      disabled={!validateBillingForm()}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred payment method
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method Selection */}
                  <RadioGroup
                    value={paymentForm.paymentMethod}
                    onValueChange={(value) => handlePaymentFormChange('paymentMethod', value)}
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <span className="font-medium">Credit/Debit Card</span>
                          <p className="text-xs text-gray-500">Visa, MasterCard, RuPay</p>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex items-center space-x-2 cursor-pointer flex-1">
                        <Phone className="h-5 w-5" />
                        <div>
                          <span className="font-medium">UPI</span>
                          <p className="text-xs text-gray-500">Pay using any UPI app</p>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="netbanking" id="netbanking" />
                      <Label htmlFor="netbanking" className="flex items-center space-x-2 cursor-pointer flex-1">
                        <BookOpen className="h-5 w-5" />
                        <div>
                          <span className="font-medium">Net Banking</span>
                          <p className="text-xs text-gray-500">All major banks supported</p>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex items-center space-x-2 cursor-pointer flex-1">
                        <Phone className="h-5 w-5" />
                        <div>
                          <span className="font-medium">Wallet</span>
                          <p className="text-xs text-gray-500">Paytm, PhonePe, Amazon Pay</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Card Details Form */}
                  {paymentForm.paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                          id="cardholderName"
                          value={paymentForm.cardholderName}
                          onChange={(e) => handlePaymentFormChange('cardholderName', e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          value={paymentForm.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                            if (value.length <= 19) {
                              handlePaymentFormChange('cardNumber', value);
                            }
                          }}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            value={paymentForm.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              handlePaymentFormChange('expiryDate', value);
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            value={paymentForm.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 4) {
                                handlePaymentFormChange('cvv', value);
                              }
                            }}
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveCard"
                          checked={paymentForm.saveCard}
                          onCheckedChange={(checked) => handlePaymentFormChange('saveCard', checked)}
                        />
                        <Label htmlFor="saveCard" className="text-sm">
                          Save card details for future purchases
                        </Label>
                      </div>
                    </div>
                  )}

                  {/* UPI Form */}
                  {paymentForm.paymentMethod === 'upi' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input
                          id="upiId"
                          value={paymentForm.upiId}
                          onChange={(e) => handlePaymentFormChange('upiId', e.target.value)}
                          placeholder="yourname@paytm, yourname@phonepe"
                          className={paymentForm.upiId && !validateUPI(paymentForm.upiId) ? 'border-red-500' : ''}
                        />
                        {paymentForm.upiId && !validateUPI(paymentForm.upiId) && (
                          <p className="text-xs text-red-500 mt-1">Please enter a valid UPI ID</p>
                        )}
                      </div>

                      <div>
                        <Label>Or choose a UPI app</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {UPI_APPS.map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => handlePaymentFormChange('selectedUpiApp', app.id)}
                              className={`p-3 border rounded-lg text-center hover:bg-gray-50 transition-colors ${
                                paymentForm.selectedUpiApp === app.id ? 'border-blue-500 bg-blue-50' : ''
                              }`}
                            >
                              <div className="text-2xl mb-1">{app.icon}</div>
                              <div className="text-xs font-medium">{app.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Banking Form */}
                  {paymentForm.paymentMethod === 'netbanking' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="netbankingBank">Select Your Bank</Label>
                        <Select
                          value={paymentForm.netbankingBank}
                          onValueChange={(value) => handlePaymentFormChange('netbankingBank', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your bank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sbi">State Bank of India</SelectItem>
                            <SelectItem value="hdfc">HDFC Bank</SelectItem>
                            <SelectItem value="icici">ICICI Bank</SelectItem>
                            <SelectItem value="axis">Axis Bank</SelectItem>
                            <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                            <SelectItem value="pnb">Punjab National Bank</SelectItem>
                            <SelectItem value="bob">Bank of Baroda</SelectItem>
                            <SelectItem value="canara">Canara Bank</SelectItem>
                            <SelectItem value="union">Union Bank of India</SelectItem>
                            <SelectItem value="other">Other Banks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Wallet Payment Info */}
                  {paymentForm.paymentMethod === 'wallet' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Wallet Payment</h4>
                        <p className="text-sm text-blue-800">
                          You'll be redirected to choose from available wallet options including Paytm, PhonePe, Amazon Pay, and more.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back to Billing
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(3)}
                      disabled={!validatePaymentForm()}
                    >
                      Review Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Review Your Order
                  </CardTitle>
                  <CardDescription>
                    Please review your order details before completing payment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Billing Details Review */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Billing Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{billingForm.firstName} {billingForm.lastName}</p>
                      <p className="text-sm text-gray-600">{billingForm.email}</p>
                      <p className="text-sm text-gray-600">{billingForm.phone}</p>
                      {billingForm.address && (
                        <p className="text-sm text-gray-600 mt-1">
                          {billingForm.address}, {billingForm.city}, {billingForm.state} {billingForm.pincode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Method Review */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {paymentForm.paymentMethod === 'card' && (
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-5 w-5 text-gray-600" />
                          <span>Card ending in {paymentForm.cardNumber.slice(-4)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      Back to Payment
                    </Button>
                    <Button 
                      onClick={processPayment}
                      disabled={paymentLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {paymentLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Complete Payment
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Success */}
            {currentStep === 4 && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful! 🎉</h2>
                  <p className="text-gray-600 mb-6">
                    Welcome to <strong>{batch.name}</strong>! You now have access to all batch materials and resources.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Redirecting to your batch in 3 seconds...</p>
                    <Button asChild>
                      <Link href={`/student/batches/${batchId}`}>
                        Access Your Batch
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Batch Details */}
                <div className="flex space-x-4">
                  {batch.thumbnail ? (
                    <img
                      src={batch.thumbnail}
                      alt={batch.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{batch.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">{batch.category}</Badge>
                      <Badge variant="secondary" className="text-xs">{batch.class_type}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Batch Features */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">What's Included:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Complete course curriculum</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Video lectures & study materials</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Live doubt sessions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Mock tests & practice papers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Performance analytics</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Batch Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Starts: {formatDate(batch.start_date || '')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{batch.schedule_days?.length || 0} days per week</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{batch.current_students}/{batch.capacity} enrolled</span>
                  </div>
                  {batch.teacher_name && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>By {batch.teacher_name}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Batch Fee</span>
                    <span>₹{orderSummary.subtotal.toLocaleString()}</span>
                  </div>
                  {orderSummary.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{orderSummary.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>GST (18%)</span>
                    <span>₹{orderSummary.taxes.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{orderSummary.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">
                      Secure 256-bit SSL encrypted checkout
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}