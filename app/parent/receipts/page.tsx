'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ParentLayout from '@/components/layout/ParentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Download, Search, Filter, Receipt } from 'lucide-react';

interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  childName: string;
  childId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId: string;
  feeType: string;
  period: string;
  status: 'PAID' | 'REFUNDED' | 'CANCELLED';
  downloadUrl: string;
  description: string;
  breakdown: {
    item: string;
    amount: number;
  }[];
}

export default function ParentReceipts() {
  const searchParams = useSearchParams();
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChild, setFilterChild] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    // Handle query parameters
    const child = searchParams.get('child');
    const method = searchParams.get('method');
    const search = searchParams.get('search');
    
    if (child) setFilterChild(child);
    if (method) setFilterMethod(method);
    if (search) setSearchTerm(search);

    // Mock data for payment receipts
    setReceipts([
      {
        id: '1',
        receiptNumber: 'REC-2024-001',
        childName: 'Emma Wilson',
        childId: '1',
        amount: 8500,
        paymentDate: '2024-06-10T14:30:00Z',
        paymentMethod: 'BANK_TRANSFER',
        transactionId: 'TXN-BANK-20240610-001',
        feeType: 'Monthly Fee',
        period: 'June 2024',
        status: 'PAID',
        downloadUrl: '/receipts/REC-2024-001.pdf',
        description: 'Monthly fee payment for June 2024 including tuition, transportation, and library access.',
        breakdown: [
          { item: 'Advanced Mathematics', amount: 2500 },
          { item: 'Physics', amount: 2800 },
          { item: 'English Literature', amount: 2200 },
          { item: 'Bus Transportation', amount: 1000 }
        ]
      },
      {
        id: '2',
        receiptNumber: 'REC-2024-002',
        childName: 'Alex Wilson',
        childId: '2',
        amount: 7200,
        paymentDate: '2024-06-12T09:15:00Z',
        paymentMethod: 'CARD',
        transactionId: 'TXN-CARD-20240612-002',
        feeType: 'Monthly Fee',
        period: 'June 2024',
        status: 'PAID',
        downloadUrl: '/receipts/REC-2024-002.pdf',
        description: 'Monthly fee payment for June 2024 including tuition, transportation, and activities.',
        breakdown: [
          { item: 'Mathematics', amount: 2000 },
          { item: 'Science', amount: 2200 },
          { item: 'English', amount: 1800 },
          { item: 'Bus Transportation', amount: 1000 },
          { item: 'Sports Activities', amount: 200 }
        ]
      },
      {
        id: '3',
        receiptNumber: 'REC-2024-003',
        childName: 'Emma Wilson',
        childId: '1',
        amount: 8500,
        paymentDate: '2024-05-12T16:45:00Z',
        paymentMethod: 'CASH',
        transactionId: 'TXN-CASH-20240512-003',
        feeType: 'Monthly Fee',
        period: 'May 2024',
        status: 'PAID',
        downloadUrl: '/receipts/REC-2024-003.pdf',
        description: 'Monthly fee payment for May 2024 including tuition and additional services.',
        breakdown: [
          { item: 'Advanced Mathematics', amount: 2500 },
          { item: 'Physics', amount: 2800 },
          { item: 'English Literature', amount: 2200 },
          { item: 'Library Access', amount: 400 },
          { item: 'Lab Equipment', amount: 600 }
        ]
      },
      {
        id: '4',
        receiptNumber: 'REC-2024-004',
        childName: 'Alex Wilson',
        childId: '2',
        amount: 7200,
        paymentDate: '2024-05-14T11:20:00Z',
        paymentMethod: 'BANK_TRANSFER',
        transactionId: 'TXN-BANK-20240514-004',
        feeType: 'Monthly Fee',
        period: 'May 2024',
        status: 'PAID',
        downloadUrl: '/receipts/REC-2024-004.pdf',
        description: 'Monthly fee payment for May 2024 including tuition and extracurricular activities.',
        breakdown: [
          { item: 'Mathematics', amount: 2000 },
          { item: 'Science', amount: 2200 },
          { item: 'English', amount: 1800 },
          { item: 'Library Access', amount: 400 },
          { item: 'Sports Activities', amount: 800 }
        ]
      },
      {
        id: '5',
        receiptNumber: 'REC-2024-005',
        childName: 'Emma Wilson',
        childId: '1',
        amount: 1500,
        paymentDate: '2024-04-20T13:10:00Z',
        paymentMethod: 'CARD',
        transactionId: 'TXN-CARD-20240420-005',
        feeType: 'Exam Fee',
        period: 'Q1 2024',
        status: 'PAID',
        downloadUrl: '/receipts/REC-2024-005.pdf',
        description: 'Examination fee for Q1 2024 mid-term assessments.',
        breakdown: [
          { item: 'Mathematics Exam', amount: 500 },
          { item: 'Physics Exam', amount: 500 },
          { item: 'English Exam', amount: 500 }
        ]
      },
      {
        id: '6',
        receiptNumber: 'REC-2024-006',
        childName: 'Alex Wilson',
        childId: '2',
        amount: 1200,
        paymentDate: '2024-04-22T15:30:00Z',
        paymentMethod: 'BANK_TRANSFER',
        transactionId: 'TXN-BANK-20240422-006',
        feeType: 'Exam Fee',
        period: 'Q1 2024',
        status: 'PAID',
        downloadUrl: '/receipts/REC-2024-006.pdf',
        description: 'Examination fee for Q1 2024 mid-term assessments.',
        breakdown: [
          { item: 'Mathematics Exam', amount: 400 },
          { item: 'Science Exam', amount: 400 },
          { item: 'English Exam', amount: 400 }
        ]
      }
    ]);

    setLoading(false);
  }, [searchParams]);

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = searchTerm === '' || 
      receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesChild = filterChild === 'all' || receipt.childId === filterChild;
    const matchesMethod = filterMethod === 'all' || receipt.paymentMethod === filterMethod;
    const matchesPeriod = filterPeriod === 'all' || receipt.period.includes(filterPeriod);
    
    return matchesSearch && matchesChild && matchesMethod && matchesPeriod;
  });

  // Sort receipts
  const sortedReceipts = [...filteredReceipts].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
      case 'date-asc':
        return new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  const uniqueChildren = Array.from(new Set(receipts.map(r => ({ id: r.childId, name: r.childName }))));
  const uniquePeriods = Array.from(new Set(receipts.map(r => r.period)));
  
  const totalReceipts = receipts.length;
  const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const thisMonthReceipts = receipts.filter(r => 
    new Date(r.paymentDate).getMonth() === new Date().getMonth() &&
    new Date(r.paymentDate).getFullYear() === new Date().getFullYear()
  ).length;
  const recentReceipts = receipts.filter(r => 
    new Date(r.paymentDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-100';
      case 'REFUNDED':
        return 'text-blue-600 bg-blue-100';
      case 'CANCELLED':
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

  const handleDownload = (receipt: PaymentReceipt) => {
    // Mock download functionality
    console.log(`Downloading receipt: ${receipt.receiptNumber}`);
    // In a real app, this would trigger the actual file download
  };

  if (loading) {
    return (
      <ParentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading receipts...</div>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="space-y-8">
        <HubHeader
          title="Payment Receipts & Records"
          subtitle="Download, search, and manage all your payment receipts and transaction records"
          actions={
            <>
              <HubActionButton href="/parent/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <HubActionButton href="/parent/fees" icon={Receipt} label="View Fees" color="blue" />
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Total Receipts"
            value={totalReceipts}
            subtitle="All payment records"
            icon="receipt"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Total Paid"
            value={`₹${totalAmount.toLocaleString()}`}
            subtitle="All time payments"
            icon="credit-card"
            color="green"
          />
          <ProfessionalMetricCard
            title="This Month"
            value={thisMonthReceipts}
            subtitle="Recent payments"
            icon="calendar"
            color="purple"
          />
          <ProfessionalMetricCard
            title="Last 30 Days"
            value={recentReceipts}
            subtitle="Recent receipts"
            icon="clock"
            color="orange"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by receipt number, child name, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Child</label>
                <select
                  value={filterChild}
                  onChange={(e) => setFilterChild(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Children</option>
                  {uniqueChildren.map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Methods</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Card Payment</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Periods</option>
                  {uniquePeriods.map(period => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date-desc">Date (Newest First)</option>
                  <option value="date-asc">Date (Oldest First)</option>
                  <option value="amount-desc">Amount (Highest First)</option>
                  <option value="amount-asc">Amount (Lowest First)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Receipts List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Payment Receipts</h3>
            <span className="text-sm text-gray-500">
              {sortedReceipts.length} receipts found
            </span>
          </div>

          {sortedReceipts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Receipts Found</h3>
              <p className="text-gray-600">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedReceipts.map((receipt) => (
                <div key={receipt.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getPaymentMethodIcon(receipt.paymentMethod)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{receipt.receiptNumber}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(receipt.status)}`}>
                          {receipt.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="space-y-1">
                          <p><strong>Child:</strong> {receipt.childName}</p>
                          <p><strong>Fee Type:</strong> {receipt.feeType}</p>
                          <p><strong>Period:</strong> {receipt.period}</p>
                        </div>
                        <div className="space-y-1">
                          <p><strong>Payment Date:</strong> {new Date(receipt.paymentDate).toLocaleDateString()}</p>
                          <p><strong>Method:</strong> {receipt.paymentMethod.replace('_', ' ')}</p>
                          <p><strong>Transaction ID:</strong> {receipt.transactionId}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-4">{receipt.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ₹{receipt.amount.toLocaleString()}
                      </div>
                      <button
                        onClick={() => handleDownload(receipt)}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Payment Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {receipt.breakdown.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                          <span className="text-sm text-gray-700">{item.item}</span>
                          <span className="text-sm font-medium text-gray-900">₹{item.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                      <span className="font-medium text-gray-900">Total Amount</span>
                      <span className="font-bold text-lg text-green-600">₹{receipt.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium text-gray-900">Download All</div>
              <div className="text-sm text-gray-600">Download all receipts as ZIP</div>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-gray-900">Export Summary</div>
              <div className="text-sm text-gray-600">Export payment summary</div>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
              <div className="text-2xl mb-2">📧</div>
              <div className="font-medium text-gray-900">Email Receipts</div>
              <div className="text-sm text-gray-600">Email selected receipts</div>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-medium text-gray-900">Tax Summary</div>
              <div className="text-sm text-gray-600">Generate tax summary</div>
            </button>
          </div>
        </div>
      </div>
    </ParentLayout>
  );
}
