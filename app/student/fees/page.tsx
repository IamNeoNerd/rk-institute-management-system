'use client';

import { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, CreditCard, Receipt } from 'lucide-react';

interface FeeAllocation {
  id: string;
  month: string;
  year: number;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  status: 'PAID' | 'PENDING';
  dueDate: string;
  paidDate?: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
}

export default function StudentFees() {
  const [feeAllocations, setFeeAllocations] = useState<FeeAllocation[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  useEffect(() => {
    // Mock data for student's fee allocations and payment history
    setFeeAllocations([
      {
        id: '1',
        month: 'June 2024',
        year: 2024,
        grossAmount: 9000,
        discountAmount: 500,
        netAmount: 8500,
        status: 'PAID',
        dueDate: '2024-06-15',
        paidDate: '2024-06-10',
      },
      {
        id: '2',
        month: 'May 2024',
        year: 2024,
        grossAmount: 9000,
        discountAmount: 500,
        netAmount: 8500,
        status: 'PAID',
        dueDate: '2024-05-15',
        paidDate: '2024-05-12',
      },
      {
        id: '3',
        month: 'April 2024',
        year: 2024,
        grossAmount: 9000,
        discountAmount: 500,
        netAmount: 8500,
        status: 'PAID',
        dueDate: '2024-04-15',
        paidDate: '2024-04-14',
      },
      {
        id: '4',
        month: 'March 2024',
        year: 2024,
        grossAmount: 9000,
        discountAmount: 500,
        netAmount: 8500,
        status: 'PENDING',
        dueDate: '2024-03-15',
      },
    ]);

    setPaymentHistory([
      {
        id: '1',
        amount: 8500,
        paymentDate: '2024-06-10',
        paymentMethod: 'BANK_TRANSFER',
        reference: 'PAY-FAMILY-1-202406',
      },
      {
        id: '2',
        amount: 8500,
        paymentDate: '2024-05-12',
        paymentMethod: 'CARD',
        reference: 'PAY-FAMILY-1-202405',
      },
      {
        id: '3',
        amount: 8500,
        paymentDate: '2024-04-14',
        paymentMethod: 'CASH',
        reference: 'PAY-FAMILY-1-202404',
      },
    ]);

    setLoading(false);
  }, []);

  const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutstanding = feeAllocations
    .filter(allocation => allocation.status === 'PENDING')
    .reduce((sum, allocation) => sum + allocation.netAmount, 0);

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return '💵';
      case 'CARD':
        return '💳';
      case 'BANK_TRANSFER':
        return '🏦';
      case 'CHEQUE':
        return '📝';
      default:
        return '💰';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'PAID' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading fee information...</div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-8">
        <HubHeader
          title="Fees & Payments"
          subtitle="Track your fee structure, payments, and outstanding dues"
          actions={
            <>
              <HubActionButton href="/student/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton href="#" icon={CreditCard} label="Make Payment" color="green" />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProfessionalMetricCard
            title="Total Paid"
            value={`₹${totalPaid.toLocaleString()}`}
            subtitle="This academic year"
            icon="check-circle"
            color="green"
          />
          <ProfessionalMetricCard
            title="Outstanding Dues"
            value={`₹${totalOutstanding.toLocaleString()}`}
            subtitle={totalOutstanding > 0 ? 'Payment pending' : 'All clear!'}
            icon={totalOutstanding > 0 ? 'alert-triangle' : 'check-circle'}
            color={totalOutstanding > 0 ? 'red' : 'green'}
          />
          <ProfessionalMetricCard
            title="Monthly Fee"
            value="₹8,500"
            subtitle="After discounts"
            icon="dollar-sign"
            color="blue"
          />
        </div>

        {/* Fee Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Current Month Fee Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Advanced Mathematics</span>
              <span className="text-gray-600">₹2,500</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Physics</span>
              <span className="text-gray-600">₹2,800</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">English Literature</span>
              <span className="text-gray-600">₹2,200</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Bus Transportation</span>
              <span className="text-gray-600">₹1,000</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Library Access</span>
              <span className="text-gray-600">₹400</span>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Gross Amount:</span>
                <span>₹9,000</span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span>Merit Discount:</span>
                <span>-₹500</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
                <span>Net Amount:</span>
                <span>₹8,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}