"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  CreditCard, 
  Eye, 
  Download, 
  CheckCircle, 
  Clock, 
  XCircle,
  RefreshCw,
  Calendar,
  Receipt,
  Smartphone,
  Building
} from "lucide-react";
import { toast } from "sonner";

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
  paid_at?: string;
  receipt_number: string;
  billing_name: string;
  billing_email: string;
  gateway_payment_id?: string;
  card_last_four?: string;
  card_type?: string;
  upi_id?: string;
  batches: {
    id: string;
    name: string;
    category: string;
    class_type: string;
    thumbnail?: string;
  };
}

interface PaymentHistoryProps {
  limit?: number;
  showHeader?: boolean;
}

export function PaymentHistory({ limit, showHeader = true }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasMore: false
  });

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
    }
  }, [user]);

  const fetchPaymentHistory = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: (limit || 10).toString()
      });

      const response = await fetch(`/api/payments/history?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }

      const data = await response.json();
      setPayments(data.payments || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, hasMore: false });
      
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'upi':
        return <Smartphone className="h-4 w-4" />;
      case 'netbanking':
        return <Building className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const downloadReceipt = async (paymentId: string) => {
    try {
      // This would typically generate and download a PDF receipt
      toast.info('Receipt download feature coming soon!');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            View all your payment transactions and download receipts
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Yet</h3>
            <p className="text-gray-500">
              Your payment history will appear here once you enroll in batches.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {payment.batches.thumbnail ? (
                            <img
                              src={payment.batches.thumbnail}
                              alt={payment.batches.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {payment.batches.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{payment.batches.name}</p>
                            <p className="text-xs text-gray-500">
                              {payment.batches.category} • {payment.batches.class_type}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">
                          ₹{payment.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.currency}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(payment.payment_method)}
                          <span className="capitalize text-sm">
                            {payment.payment_method}
                          </span>
                        </div>
                        {payment.card_last_four && (
                          <div className="text-xs text-gray-500">
                            **** {payment.card_last_four}
                          </div>
                        )}
                        {payment.upi_id && (
                          <div className="text-xs text-gray-500">
                            {payment.upi_id}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(payment.status)}
                            <span className="capitalize">{payment.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(payment.created_at)}
                        </div>
                        {payment.paid_at && payment.status === 'success' && (
                          <div className="text-xs text-gray-500">
                            Paid: {formatDate(payment.paid_at)}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPayment(payment)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Payment Details</DialogTitle>
                              </DialogHeader>
                              {selectedPayment && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium text-gray-500">Receipt Number</Label>
                                      <p className="font-mono text-sm">{selectedPayment.receipt_number}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-500">Payment ID</Label>
                                      <p className="font-mono text-sm">{selectedPayment.gateway_payment_id || 'N/A'}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">Billing Details</Label>
                                    <p className="text-sm">{selectedPayment.billing_name}</p>
                                    <p className="text-sm text-gray-600">{selectedPayment.billing_email}</p>
                                  </div>
                                  
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium">Total Amount</span>
                                      <span className="text-lg font-bold">
                                        ₹{selectedPayment.amount.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {payment.status === 'success' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadReceipt(payment.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {pagination.hasMore && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => fetchPaymentHistory(pagination.page + 1)}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}