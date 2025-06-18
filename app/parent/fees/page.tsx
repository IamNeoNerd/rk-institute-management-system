'use client';

import { useState, useEffect } from 'react';
import ParentLayout from '@/components/layout/ParentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, CreditCard, Download, AlertTriangle } from 'lucide-react';

interface FeeAllocation {
  id: string;
  childName: string;
  childId: string;
  month: string;
  year: number;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  dueDate: string;
  paidDate?: string;
  courses: {
    name: string;
    amount: number;
  }[];
  services: {
    name: string;
    amount: number;
  }[];
}

interface PaymentHistory {
  id: string;
  childName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  status: string;
}

export default function ParentFees() {
  const [feeAllocations, setFeeAllocations] = useState<FeeAllocation[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  useEffect(() => {
    // Mock data for family's fee allocations and payment history
    setFeeAllocations([
      {
        id: '1',
        childName: 'Emma Wilson',
        childId: '1',
        month: 'June 2024',
        year: 2024,
        grossAmount: 9000,
        discountAmount: 500,
        netAmount: 8500,
        status: 'PAID',
        dueDate: '2024-06-15',
        paidDate: '2024-06-10',
        courses: [
          { name: 'Advanced Mathematics', amount: 2500 },
          { name: 'Physics', amount: 2800 },
          { name: 'English Literature', amount: 2200 }
        ],
        services: [
          { name: 'Bus Transportation', amount: 1000 },
          { name: 'Library Access', amount: 400 },
          { name: 'Lab Equipment', amount: 100 }
        ]
      },
      {
        id: '2',
        childName: 'Alex Wilson',
        childId: '2',
        month: 'June 2024',
        year: 2024,
        grossAmount: 7500,
        discountAmount: 300,
        netAmount: 7200,
        status: 'PAID',
        dueDate: '2024-06-15',
        paidDate: '2024-06-12',
        courses: [
          { name: 'Mathematics', amount: 2000 },
          { name: 'Science', amount: 2200 },
          { name: 'English', amount: 1800 }
        ],
        services: [
          { name: 'Bus Transportation', amount: 1000 },
          { name: 'Library Access', amount: 400 },
          { name: 'Sports Activities', amount: 100 }
        ]
      },
      {
        id: '3',
        childName: 'Emma Wilson',
        childId: '1',
        month: 'July 2024',
        year: 2024,
        grossAmount: 9000,
        discountAmount: 500,
        netAmount: 8500,
        status: 'PENDING',
        dueDate: '2024-07-15',
        courses: [
          { name: 'Advanced Mathematics', amount: 2500 },
          { name: 'Physics', amount: 2800 },
          { name: 'English Literature', amount: 2200 }
        ],
        services: [
          { name: 'Bus Transportation', amount: 1000 },
          { name: 'Library Access', amount: 400 },
          { name: 'Lab Equipment', amount: 100 }
        ]
      },
      {
        id: '4',
        childName: 'Alex Wilson',
        childId: '2',
        month: 'July 2024',
        year: 2024,
        grossAmount: 7500,
        discountAmount: 300,
        netAmount: 7200,
        status: 'PENDING',
        dueDate: '2024-07-15',
        courses: [
          { name: 'Mathematics', amount: 2000 },
          { name: 'Science', amount: 2200 },
          { name: 'English', amount: 1800 }
        ],
        services: [
          { name: 'Bus Transportation', amount: 1000 },
          { name: 'Library Access', amount: 400 },
          { name: 'Sports Activities', amount: 100 }
        ]
      }
    ]);

    setPaymentHistory([
      {
        id: '1',
        childName: 'Emma Wilson',
        amount: 8500,
        paymentDate: '2024-06-10',
        paymentMethod: 'BANK_TRANSFER',
        reference: 'PAY-FAMILY-1-202406-EMMA',
        status: 'COMPLETED'
      },
      {
        id: '2',
        childName: 'Alex Wilson',
        amount: 7200,
        paymentDate: '2024-06-12',
        paymentMethod: 'CARD',
        reference: 'PAY-FAMILY-1-202406-ALEX',
        status: 'COMPLETED'
      },
      {
        id: '3',
        childName: 'Emma Wilson',
        amount: 8500,
        paymentDate: '2024-05-12',
        paymentMethod: 'CASH',
        reference: 'PAY-FAMILY-1-202405-EMMA',
        status: 'COMPLETED'
      },
      {
        id: '4',
        childName: 'Alex Wilson',
        amount: 7200,
        paymentDate: '2024-05-14',
        paymentMethod: 'BANK_TRANSFER',
        reference: 'PAY-FAMILY-1-202405-ALEX',
        status: 'COMPLETED'
      }
    ]);

    setLoading(false);
  }, []);

  const filteredAllocations = feeAllocations.filter(allocation => {
    const matchesChild = selectedChild === 'all' || allocation.childId === selectedChild;
    const matchesPeriod = selectedPeriod === 'all' ||
      (selectedPeriod === 'current' && allocation.status === 'PENDING') ||
      (selectedPeriod === 'paid' && allocation.status === 'PAID');
    return matchesChild && matchesPeriod;
  });

  const filteredPayments = paymentHistory.filter(payment => {
    return selectedChild === 'all' || payment.childName.includes(selectedChild === '1' ? 'Emma' : 'Alex');
  });

  const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutstanding = feeAllocations
    .filter(allocation => allocation.status === 'PENDING')
    .reduce((sum, allocation) => sum + allocation.netAmount, 0);
  const totalChildren = Array.from(new Set(feeAllocations.map(a => a.childName))).length;
  const overdueCount = feeAllocations.filter(a =>
    a.status === 'PENDING' && new Date() > new Date(a.dueDate)
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'OVERDUE':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

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

  const handlePayment = (allocationId: string) => {
    // Mock payment processing
    setFeeAllocations(allocations =>
      allocations.map(allocation =>
        allocation.id === allocationId
          ? { ...allocation, status: 'PAID' as const, paidDate: new Date().toISOString() }
          : allocation
      )
    );
  };

  if (loading) {
    return (
      <ParentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading fee information...</div>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="space-y-8">
        <HubHeader
          title="Fees & Payments"
          subtitle="Manage fee payments for all your children and view payment history"
          actions={
            <>
              <HubActionButton href="/parent/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton href="#" icon={CreditCard} label="Pay All Pending" color="green" />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            title="Children"
            value={totalChildren}
            subtitle="Fee management"
            icon="users"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Overdue Items"
            value={overdueCount}
            subtitle={overdueCount > 0 ? 'Needs attention' : 'All current'}
            icon={overdueCount > 0 ? 'alert-triangle' : 'check-circle'}
            color={overdueCount > 0 ? 'red' : 'green'}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Child</label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Children</option>
                <option value="1">Emma Wilson</option>
                <option value="2">Alex Wilson</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Periods</option>
                <option value="current">Pending Payments</option>
                <option value="paid">Paid Invoices</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fee Allocations */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Fee Allocations</h3>
          {filteredAllocations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Fee Records Found</h3>
              <p className="text-gray-600">Try adjusting your filters.</p>
            </div>
          ) : (
            filteredAllocations.map((allocation) => (
              <div key={allocation.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{allocation.childName}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(allocation.status)}`}>
                        {allocation.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span><strong>Period:</strong> {allocation.month}</span>
                      <span><strong>Due Date:</strong> {new Date(allocation.dueDate).toLocaleDateString()}</span>
                      {allocation.paidDate && (
                        <span><strong>Paid:</strong> {new Date(allocation.paidDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">₹{allocation.netAmount.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Net Amount</div>
                    {allocation.status === 'PENDING' && (
                      <button
                        onClick={() => handlePayment(allocation.id)}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>

                {/* Fee Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                  {/* Courses */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">📚 Courses</h4>
                    <div className="space-y-2">
                      {allocation.courses.map((course, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">{course.name}</span>
                          <span className="text-sm font-medium text-gray-900">₹{course.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">🚌 Services</h4>
                    <div className="space-y-2">
                      {allocation.services.map((service, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">{service.name}</span>
                          <span className="text-sm font-medium text-gray-900">₹{service.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Amount Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600">Gross Amount:</span>
                    <span className="font-medium">₹{allocation.grossAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-green-600">Discount:</span>
                    <span className="font-medium text-green-600">-₹{allocation.discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Net Amount:</span>
                    <span>₹{allocation.netAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment History */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Payment History</h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Child</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.childName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span>{getPaymentMethodIcon(payment.paymentMethod)}</span>
                          <span>{payment.paymentMethod.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {payment.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                          <Download className="w-4 h-4 inline mr-1" />
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ParentLayout>
  );
}