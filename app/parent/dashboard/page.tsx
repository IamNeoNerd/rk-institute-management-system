'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FamilyOverview from '../components/FamilyOverview';
import ChildrenView from '../components/ChildrenView';
import FamilyFeesView from '../components/FamilyFeesView';
import FamilyAcademicView from '../components/FamilyAcademicView';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Child {
  id: string;
  name: string;
  grade: string;
  studentId: string;
}

interface FamilyProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  discountAmount: number;
  children: Child[];
}

interface DashboardStats {
  totalChildren: number;
  totalMonthlyFee: number;
  outstandingDues: number;
  totalAchievements: number;
  totalConcerns: number;
  lastPaymentDate: string;
}

export default function ParentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalChildren: 0,
    totalMonthlyFee: 0,
    outstandingDues: 0,
    totalAchievements: 0,
    totalConcerns: 0,
    lastPaymentDate: '',
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'PARENT') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    fetchFamilyData();
  }, [router]);

  const fetchFamilyData = async () => {
    try {
      // Mock family data - in real implementation, fetch from API
      setFamilyProfile({
        id: 'family-1',
        name: 'The Johnson Family',
        email: 'johnson.family@email.com',
        phone: '+1-217-555-0101',
        address: '123 Oak Street, Springfield, IL 62701',
        discountAmount: 500,
        children: [
          {
            id: 'student-1',
            name: 'Emma Johnson',
            grade: 'Grade 11',
            studentId: 'STU001',
          },
          {
            id: 'student-2',
            name: 'Liam Johnson',
            grade: 'Grade 9',
            studentId: 'STU002',
          },
        ],
      });

      setStats({
        totalChildren: 2,
        totalMonthlyFee: 17000,
        outstandingDues: 0,
        totalAchievements: 3,
        totalConcerns: 0,
        lastPaymentDate: '2024-06-10',
      });

    } catch (error) {
      console.error('Error fetching family data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">RK Institute</h1>
              <span className="ml-4 px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-sm font-medium rounded-full">
                👨‍👩‍👧‍👦 Parent Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome,</p>
                <p className="font-semibold text-gray-900">{familyProfile?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Child Selector */}
      {familyProfile && familyProfile.children.length > 1 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">View data for:</span>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Children</option>
                {familyProfile.children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name} ({child.grade})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Family Overview', icon: '🏠' },
              { id: 'children', name: 'My Children', icon: '👨‍👩‍👧‍👦' },
              { id: 'fees', name: 'Fees & Payments', icon: '💰' },
              { id: 'academic', name: 'Academic Progress', icon: '📚' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Welcome, {familyProfile?.name}!</h2>
              <p className="text-lg opacity-90 mb-6">
                Stay connected with your children's academic journey and manage family account information
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">{stats.totalChildren} Children</span>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">Family Discount: ₹{familyProfile?.discountAmount}</span>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">
                    {stats.outstandingDues === 0 ? 'All Payments Current' : 'Payment Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Family Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Children</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalChildren}</p>
                    <p className="text-sm text-blue-600 mt-1">Enrolled students</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-3xl">👨‍👩‍👧‍👦</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Fee</p>
                    <p className="text-3xl font-bold text-gray-900">₹{stats.totalMonthlyFee.toLocaleString()}</p>
                    <p className="text-sm text-green-600 mt-1">After family discount</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <span className="text-3xl">💰</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Outstanding Dues</p>
                    <p className={`text-3xl font-bold ${stats.outstandingDues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{stats.outstandingDues.toLocaleString()}
                    </p>
                    <p className={`text-sm mt-1 ${stats.outstandingDues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {stats.outstandingDues > 0 ? 'Payment required' : 'All clear!'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stats.outstandingDues > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                    <span className="text-3xl">{stats.outstandingDues > 0 ? '⚠️' : '✅'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Achievements</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.totalAchievements}</p>
                    <p className="text-sm text-yellow-600 mt-1">This month</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <span className="text-3xl">🏆</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Areas of Concern</p>
                    <p className={`text-3xl font-bold ${stats.totalConcerns > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {stats.totalConcerns}
                    </p>
                    <p className={`text-sm mt-1 ${stats.totalConcerns > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {stats.totalConcerns > 0 ? 'Needs attention' : 'All good!'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stats.totalConcerns > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                    <span className="text-3xl">{stats.totalConcerns > 0 ? '⚠️' : '😊'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Payment</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(stats.lastPaymentDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-purple-600 mt-1">Payment received</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <span className="text-3xl">💳</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => setActiveTab('children')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 text-left group"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <span className="text-2xl">👨‍👩‍👧‍👦</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">View My Children</h3>
                    <p className="text-gray-600">Check individual progress and details</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('fees')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 text-left group"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Manage Fees & Payments</h3>
                    <p className="text-gray-600">View bills and payment history</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('academic')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 text-left group"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Academic Progress</h3>
                    <p className="text-gray-600">Track achievements and progress</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && <FamilyOverview familyProfile={familyProfile} />}
        {activeTab === 'children' && <ChildrenView selectedChild={selectedChild} />}
        {activeTab === 'fees' && <FamilyFeesView selectedChild={selectedChild} />}
        {activeTab === 'academic' && <FamilyAcademicView selectedChild={selectedChild} />}
      </main>
    </div>
  );
}
