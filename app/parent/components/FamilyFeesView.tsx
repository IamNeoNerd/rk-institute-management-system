'use client';

import EmptyState from '../../../components/shared/EmptyState';
import StatCard from '../../../components/shared/StatCard';
import { ProfessionalIcon } from '../../../components/ui/icons/ProfessionalIconSystem';

interface FamilyFeesViewProps {
  selectedChild: string;
}

interface FeeAllocation {
  id: string;
  studentName: string;
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
  allocations: string[];
}

export default function FamilyFeesView({ selectedChild }: FamilyFeesViewProps) {
  // Mock data for family fees - in real implementation, fetch from API
  const feeAllocations: FeeAllocation[] = [
    {
      id: '1',
      studentName: 'Emma Johnson',
      month: 'June 2024',
      year: 2024,
      grossAmount: 9000,
      discountAmount: 750,
      netAmount: 8250,
      status: 'PAID',
      dueDate: '2024-06-15',
      paidDate: '2024-06-10'
    },
    {
      id: '2',
      studentName: 'Liam Johnson',
      month: 'June 2024',
      year: 2024,
      grossAmount: 7500,
      discountAmount: 500,
      netAmount: 7000,
      status: 'PAID',
      dueDate: '2024-06-15',
      paidDate: '2024-06-10'
    },
    {
      id: '3',
      studentName: 'Emma Johnson',
      month: 'May 2024',
      year: 2024,
      grossAmount: 9000,
      discountAmount: 750,
      netAmount: 8250,
      status: 'PAID',
      dueDate: '2024-05-15',
      paidDate: '2024-05-12'
    },
    {
      id: '4',
      studentName: 'Liam Johnson',
      month: 'May 2024',
      year: 2024,
      grossAmount: 7500,
      discountAmount: 500,
      netAmount: 7000,
      status: 'PENDING',
      dueDate: '2024-05-15'
    }
  ];

  const paymentHistory: PaymentHistory[] = [
    {
      id: '1',
      amount: 15250,
      paymentDate: '2024-06-10',
      paymentMethod: 'BANK_TRANSFER',
      reference: 'PAY-FAMILY-1-202406',
      allocations: ['Emma Johnson - June 2024', 'Liam Johnson - June 2024']
    },
    {
      id: '2',
      amount: 8250,
      paymentDate: '2024-05-12',
      paymentMethod: 'CARD',
      reference: 'PAY-FAMILY-1-202405',
      allocations: ['Emma Johnson - May 2024']
    }
  ];

  // Filter data based on selected child
  const filteredAllocations =
    selectedChild === 'all'
      ? feeAllocations
      : feeAllocations.filter(allocation =>
          allocation.studentName.includes(
            selectedChild === 'student-1' ? 'Emma' : 'Liam'
          )
        );

  const totalPaid = paymentHistory.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const totalOutstanding = filteredAllocations
    .filter(allocation => allocation.status === 'PENDING')
    .reduce((sum, allocation) => sum + allocation.netAmount, 0);
  const currentMonthTotal = filteredAllocations
    .filter(allocation => allocation.month === 'June 2024')
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
    return status === 'PAID'
      ? 'text-green-600 bg-green-100'
      : 'text-red-600 bg-red-100';
  };

  return (
    <div className='space-y-8'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <StatCard
          title='Total Paid'
          value={`₹${totalPaid.toLocaleString()}`}
          subtitle='This academic year'
          icon={<ProfessionalIcon name='success' size={24} />}
          color='green'
        />
        <StatCard
          title='Outstanding Dues'
          value={`₹${totalOutstanding.toLocaleString()}`}
          subtitle={totalOutstanding > 0 ? 'Payment pending' : 'All clear!'}
          icon={
            totalOutstanding > 0 ? (
              <ProfessionalIcon name='warning' size={24} />
            ) : (
              <ProfessionalIcon name='success' size={24} />
            )
          }
          color={totalOutstanding > 0 ? 'red' : 'green'}
        />
        <StatCard
          title='Current Month'
          value={`₹${currentMonthTotal.toLocaleString()}`}
          subtitle='June 2024 total'
          icon={<ProfessionalIcon name='finance' size={24} />}
          color='blue'
        />
      </div>

      {/* Fee Breakdown by Child */}
      {selectedChild === 'all' && (
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            💳 Current Month Fee Breakdown by Child
          </h3>
          <div className='space-y-4'>
            <div className='bg-blue-50 rounded-lg p-4'>
              <h4 className='font-medium text-gray-900 mb-3'>
                Emma Johnson (Grade 11)
              </h4>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                <div>
                  <span className='text-gray-600'>Advanced Mathematics:</span>
                  <div className='font-medium'>₹2,500</div>
                </div>
                <div>
                  <span className='text-gray-600'>Physics:</span>
                  <div className='font-medium'>₹2,800</div>
                </div>
                <div>
                  <span className='text-gray-600'>English Literature:</span>
                  <div className='font-medium'>₹2,200</div>
                </div>
                <div>
                  <span className='text-gray-600'>Services:</span>
                  <div className='font-medium'>₹1,500</div>
                </div>
              </div>
              <div className='mt-3 pt-3 border-t border-blue-200 flex justify-between'>
                <span className='font-medium'>Net Amount:</span>
                <span className='font-bold text-blue-600'>₹8,250</span>
              </div>
            </div>

            <div className='bg-green-50 rounded-lg p-4'>
              <h4 className='font-medium text-gray-900 mb-3'>
                Liam Johnson (Grade 9)
              </h4>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                <div>
                  <span className='text-gray-600'>Foundation Mathematics:</span>
                  <div className='font-medium'>₹2,000</div>
                </div>
                <div>
                  <span className='text-gray-600'>English Literature:</span>
                  <div className='font-medium'>₹2,200</div>
                </div>
                <div>
                  <span className='text-gray-600'>Art & Design:</span>
                  <div className='font-medium'>₹1,800</div>
                </div>
                <div>
                  <span className='text-gray-600'>Services:</span>
                  <div className='font-medium'>₹2,200</div>
                </div>
              </div>
              <div className='mt-3 pt-3 border-t border-green-200 flex justify-between'>
                <span className='font-medium'>Net Amount:</span>
                <span className='font-bold text-green-600'>₹7,000</span>
              </div>
            </div>

            <div className='bg-gray-50 rounded-lg p-4'>
              <div className='flex justify-between items-center text-lg font-bold'>
                <span>Family Total (After Discounts):</span>
                <span className='text-purple-600'>₹15,250</span>
              </div>
              <div className='text-sm text-gray-600 mt-1'>
                Family Discount Applied: ₹500 (distributed proportionally)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fee History */}
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          📊 Fee History
        </h3>
        <div className='space-y-3'>
          {filteredAllocations.map(allocation => (
            <div
              key={allocation.id}
              className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'
            >
              <div className='flex-1'>
                <div className='flex items-center space-x-3'>
                  <span className='font-medium text-gray-900'>
                    {allocation.studentName}
                  </span>
                  <span className='text-gray-500'>•</span>
                  <span className='text-gray-700'>{allocation.month}</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(allocation.status)}`}
                  >
                    {allocation.status}
                  </span>
                </div>
                <div className='text-sm text-gray-600 mt-1'>
                  Due: {new Date(allocation.dueDate).toLocaleDateString()}
                  {allocation.paidDate && (
                    <span className='ml-4'>
                      Paid: {new Date(allocation.paidDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className='text-right'>
                <div className='font-semibold text-gray-900'>
                  ₹{allocation.netAmount.toLocaleString()}
                </div>
                {allocation.discountAmount > 0 && (
                  <div className='text-sm text-green-600'>
                    Discount: ₹{allocation.discountAmount.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          💳 Payment History
        </h3>
        <div className='space-y-3'>
          {paymentHistory.map(payment => (
            <div
              key={payment.id}
              className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'
            >
              <div className='flex items-center space-x-4'>
                <div className='p-2 bg-green-100 rounded-lg'>
                  <span className='text-lg'>
                    {getPaymentMethodIcon(payment.paymentMethod)}
                  </span>
                </div>
                <div>
                  <div className='font-medium text-gray-900'>
                    ₹{payment.amount.toLocaleString()}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {new Date(payment.paymentDate).toLocaleDateString()} •{' '}
                    {payment.paymentMethod.replace('_', ' ')}
                  </div>
                  <div className='text-xs text-gray-500'>
                    Ref: {payment.reference}
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    Covers: {payment.allocations.join(', ')}
                  </div>
                </div>
              </div>
              <div className='text-green-600 font-medium'>✅ Completed</div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Instructions */}
      {totalOutstanding > 0 && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-6'>
          <h3 className='text-lg font-semibold text-yellow-800 mb-3'>
            ⚠️ Payment Required
          </h3>
          <p className='text-yellow-700 mb-4'>
            You have outstanding dues of ₹{totalOutstanding.toLocaleString()}.
            Please contact the administration office for payment options.
          </p>
          <div className='space-y-2 text-sm text-yellow-700'>
            <p>
              <strong>Payment Methods:</strong> Cash, Card, Bank Transfer,
              Cheque
            </p>
            <p>
              <strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM
            </p>
            <p>
              <strong>Contact:</strong> +1-217-555-0100 | fees@rkinstitute.com
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
