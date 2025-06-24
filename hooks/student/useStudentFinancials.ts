/**
 * Student Financials Hook
 * 
 * Specialized hook for managing student financial data including fees,
 * payments, outstanding dues, and payment history.
 * 
 * Features:
 * - Fee allocation and billing information
 * - Payment history and receipts
 * - Outstanding dues tracking
 * - Payment processing
 * - Financial analytics and summaries
 */

'use client';

import { useState, useCallback } from 'react';

export interface FeeAllocation {
  id: string;
  month: string;
  year: number;
  tuitionFee: number;
  transportFee: number;
  examFee: number;
  otherFees: number;
  totalAmount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidAmount: number;
  remainingAmount: number;
}

export interface Payment {
  id: string;
  allocationId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'upi';
  transactionId?: string;
  receiptNumber: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface PaymentSummary {
  totalPaid: number;
  totalOutstanding: number;
  currentMonthDue: number;
  nextDueDate: string;
  paymentHistory: Payment[];
}

export interface UseStudentFinancialsReturn {
  // Data State
  feeAllocations: FeeAllocation[];
  payments: Payment[];
  paymentSummary: PaymentSummary | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchFeeAllocations: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  fetchPaymentSummary: () => Promise<void>;
  downloadReceipt: (paymentId: string) => Promise<void>;
  downloadFeeStructure: () => Promise<void>;
}

export function useStudentFinancials(): UseStudentFinancialsReturn {
  // Data State
  const [feeAllocations, setFeeAllocations] = useState<FeeAllocation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch fee allocations
  const fetchFeeAllocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/students/fee-allocations');
      const data = await response.json();
      
      if (data.success) {
        setFeeAllocations(data.allocations);
      } else {
        setError(data.error || 'Failed to fetch fee allocations');
      }
    } catch (err) {
      setError('Network error while fetching fee allocations');
      console.error('Error fetching fee allocations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/students/payments');
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.payments);
      } else {
        setError(data.error || 'Failed to fetch payments');
      }
    } catch (err) {
      setError('Network error while fetching payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch payment summary
  const fetchPaymentSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/students/payment-summary');
      const data = await response.json();
      
      if (data.success) {
        setPaymentSummary(data.summary);
      } else {
        setError(data.error || 'Failed to fetch payment summary');
      }
    } catch (err) {
      setError('Network error while fetching payment summary');
      console.error('Error fetching payment summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Download receipt
  const downloadReceipt = useCallback(async (paymentId: string) => {
    try {
      const response = await fetch(`/api/students/payments/${paymentId}/receipt`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${paymentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download receipt');
      }
    } catch (err) {
      setError('Network error while downloading receipt');
      console.error('Error downloading receipt:', err);
    }
  }, []);

  // Download fee structure
  const downloadFeeStructure = useCallback(async () => {
    try {
      const response = await fetch('/api/students/fee-structure');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fee-structure.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download fee structure');
      }
    } catch (err) {
      setError('Network error while downloading fee structure');
      console.error('Error downloading fee structure:', err);
    }
  }, []);

  return {
    // Data State
    feeAllocations,
    payments,
    paymentSummary,
    loading,
    error,
    
    // Actions
    fetchFeeAllocations,
    fetchPayments,
    fetchPaymentSummary,
    downloadReceipt,
    downloadFeeStructure,
  };
}
