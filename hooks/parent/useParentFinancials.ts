/**
 * Parent Financials Hook
 *
 * Specialized hook for managing parent financial data including family fees,
 * payments, outstanding dues, and family discounts.
 *
 * Features:
 * - Family fee allocation and billing information
 * - Payment history and receipts
 * - Outstanding dues tracking for all children
 * - Family discount management
 * - Child-specific fee filtering
 * - Financial analytics and summaries
 */

'use client';

import { useState, useCallback } from 'react';

import {
  FamilyFeeAllocation,
  FamilyPayment
} from '@/components/features/parent-portal/types';

export interface FamilyFinancialSummary {
  totalMonthlyFee: number;
  familyDiscount: number;
  totalOutstanding: number;
  totalPaid: number;
  nextDueDate: string;
  paymentHistory: FamilyPayment[];
  childrenFees: {
    childId: string;
    childName: string;
    monthlyFee: number;
    outstanding: number;
  }[];
}

export interface UseParentFinancialsReturn {
  // Data State
  familyFeeAllocations: FamilyFeeAllocation[];
  familyPayments: FamilyPayment[];
  financialSummary: FamilyFinancialSummary | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchFamilyFeeAllocations: (childId?: string) => Promise<void>;
  fetchFamilyPayments: () => Promise<void>;
  fetchFinancialSummary: () => Promise<void>;
  downloadFamilyReceipt: (paymentId: string) => Promise<void>;
  downloadFamilyFeeStructure: () => Promise<void>;
  getFeesByChild: (childId: string) => FamilyFeeAllocation[];
  getOutstandingByChild: (childId: string) => number;
  getTotalFamilyOutstanding: () => number;
}

export function useParentFinancials(): UseParentFinancialsReturn {
  // Data State
  const [familyFeeAllocations, setFamilyFeeAllocations] = useState<
    FamilyFeeAllocation[]
  >([]);
  const [familyPayments, setFamilyPayments] = useState<FamilyPayment[]>([]);
  const [financialSummary, setFinancialSummary] =
    useState<FamilyFinancialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch family fee allocations
  const fetchFamilyFeeAllocations = useCallback(async (childId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const url = childId
        ? `/api/parents/fee-allocations?childId=${childId}`
        : '/api/parents/fee-allocations';

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFamilyFeeAllocations(data.allocations || []);
      } else {
        setError('Failed to fetch family fee allocations');
      }
    } catch (err) {
      setError('Network error while fetching family fee allocations');
      console.error('Error fetching family fee allocations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch family payments
  const fetchFamilyPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/parents/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFamilyPayments(data.payments || []);
      } else {
        setError('Failed to fetch family payments');
      }
    } catch (err) {
      setError('Network error while fetching family payments');
      console.error('Error fetching family payments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch financial summary
  const fetchFinancialSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/parents/financial-summary', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFinancialSummary(data.summary);
      } else {
        setError('Failed to fetch financial summary');
      }
    } catch (err) {
      setError('Network error while fetching financial summary');
      console.error('Error fetching financial summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Download family receipt
  const downloadFamilyReceipt = useCallback(async (paymentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/parents/payments/${paymentId}/receipt`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `family-receipt-${paymentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download family receipt');
      }
    } catch (err) {
      setError('Network error while downloading family receipt');
      console.error('Error downloading family receipt:', err);
    }
  }, []);

  // Download family fee structure
  const downloadFamilyFeeStructure = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/parents/fee-structure', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'family-fee-structure.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download family fee structure');
      }
    } catch (err) {
      setError('Network error while downloading family fee structure');
      console.error('Error downloading family fee structure:', err);
    }
  }, []);

  // Get fees by child
  const getFeesByChild = useCallback(
    (childId: string): FamilyFeeAllocation[] => {
      return familyFeeAllocations.filter(
        allocation => allocation.childId === childId
      );
    },
    [familyFeeAllocations]
  );

  // Get outstanding by child
  const getOutstandingByChild = useCallback(
    (childId: string): number => {
      const childFees = getFeesByChild(childId);
      return childFees.reduce((total, fee) => total + fee.remainingAmount, 0);
    },
    [getFeesByChild]
  );

  // Get total family outstanding
  const getTotalFamilyOutstanding = useCallback((): number => {
    return familyFeeAllocations.reduce(
      (total, fee) => total + fee.remainingAmount,
      0
    );
  }, [familyFeeAllocations]);

  return {
    // Data State
    familyFeeAllocations,
    familyPayments,
    financialSummary,
    loading,
    error,

    // Actions
    fetchFamilyFeeAllocations,
    fetchFamilyPayments,
    fetchFinancialSummary,
    downloadFamilyReceipt,
    downloadFamilyFeeStructure,
    getFeesByChild,
    getOutstandingByChild,
    getTotalFamilyOutstanding
  };
}
