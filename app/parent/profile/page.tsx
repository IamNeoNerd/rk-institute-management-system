'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ParentLayout from '@/components/layout/ParentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, User, Edit, Save, Phone, Mail } from 'lucide-react';

interface ParentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  preferences: {
    communicationMethod: 'EMAIL' | 'SMS' | 'PHONE' | 'ALL';
    language: string;
    timezone: string;
    notifications: {
      academicUpdates: boolean;
      feeReminders: boolean;
      eventNotifications: boolean;
      emergencyAlerts: boolean;
    };
  };
  children: {
    id: string;
    name: string;
    grade: string;
    rollNumber: string;
  }[];
  lastUpdated: string;
}

export default function ParentProfile() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ParentProfile | null>(null);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    // Handle query parameters
    const tab = searchParams.get('tab');
    const action = searchParams.get('action');

    if (tab) setActiveTab(tab);
    if (action === 'edit') setIsEditing(true);
  }, [searchParams]);

  useEffect(() => {
    // Mock data for parent profile - only load once
    const mockProfile: ParentProfile = {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+1 (555) 123-4567',
      address: {
        street: '123 Oak Street',
        city: 'Springfield',
        state: 'Illinois',
        zipCode: '62701',
        country: 'United States'
      },
      emergencyContact: {
        name: 'John Wilson',
        relationship: 'Spouse',
        phone: '+1 (555) 987-6543',
        email: 'john.wilson@email.com'
      },
      preferences: {
        communicationMethod: 'EMAIL',
        language: 'English',
        timezone: 'America/Chicago',
        notifications: {
          academicUpdates: true,
          feeReminders: true,
          eventNotifications: true,
          emergencyAlerts: true
        }
      },
      children: [
        {
          id: '1',
          name: 'Emma Wilson',
          grade: 'Grade 11',
          rollNumber: 'RK2024001'
        },
        {
          id: '2',
          name: 'Alex Wilson',
          grade: 'Grade 9',
          rollNumber: 'RK2024002'
        }
      ],
      lastUpdated: '2024-06-15T10:30:00Z'
    };

    setProfile(mockProfile);
    setEditedProfile(mockProfile);
    setLoading(false);
  }, []); // Empty dependency array - only run once

  const handleSave = () => {
    if (editedProfile) {
      setProfile({ ...editedProfile, lastUpdated: new Date().toISOString() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const updateEditedProfile = (field: string, value: any) => {
    if (!editedProfile) return;
    
    const keys = field.split('.');
    const updatedProfile = { ...editedProfile };
    let current: any = updatedProfile;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setEditedProfile(updatedProfile);
  };

  if (loading || !profile) {
    return (
      <ParentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading profile...</div>
        </div>
      </ParentLayout>
    );
  }

  const currentProfile = isEditing ? editedProfile! : profile;

  return (
    <ParentLayout>
      <div className="space-y-8">
        <HubHeader
          title="Family Profile Management"
          subtitle="Manage your personal information, preferences, and family details"
          actions={
            <>
              <HubActionButton href="/parent/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              {isEditing ? (
                <>
                  <HubActionButton 
                    href="#" 
                    icon={Save} 
                    label="Save Changes" 
                    color="green"
                    onClick={handleSave}
                  />
                  <HubActionButton 
                    href="#" 
                    icon={FileText} 
                    label="Cancel" 
                    color="gray"
                    onClick={handleCancel}
                  />
                </>
              ) : (
                <HubActionButton 
                  href="#" 
                  icon={Edit} 
                  label="Edit Profile" 
                  color="blue"
                  onClick={() => setIsEditing(true)}
                />
              )}
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Profile Status"
            value="Complete"
            subtitle="All information filled"
            icon="check-circle"
            color="green"
          />
          <ProfessionalMetricCard
            title="Children Enrolled"
            value={currentProfile.children.length}
            subtitle="Active students"
            icon="users"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Communication"
            value={currentProfile.preferences.communicationMethod}
            subtitle="Preferred method"
            icon="message-square"
            color="purple"
          />
          <ProfessionalMetricCard
            title="Last Updated"
            value={new Date(currentProfile.lastUpdated).toLocaleDateString()}
            subtitle="Profile information"
            icon="calendar"
            color="orange"
          />
        </div>

        {/* Profile Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'personal'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'contact'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Contact & Address
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'emergency'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Emergency Contact
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'preferences'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Preferences
            </button>
            <button
              onClick={() => setActiveTab('children')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'children'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Children
            </button>
          </div>

          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentProfile.firstName}
                      onChange={(e) => updateEditedProfile('firstName', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">{currentProfile.firstName}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentProfile.lastName}
                      onChange={(e) => updateEditedProfile('lastName', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">{currentProfile.lastName}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {currentProfile.firstName.charAt(0)}{currentProfile.lastName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">{currentProfile.firstName} {currentProfile.lastName}</h4>
                  <p className="text-blue-700">Parent/Guardian</p>
                  <p className="text-blue-600 text-sm">Member since 2024</p>
                </div>
              </div>
            </div>
          )}

          {/* Contact & Address Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={currentProfile.email}
                      onChange={(e) => updateEditedProfile('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{currentProfile.email}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={currentProfile.phone}
                      onChange={(e) => updateEditedProfile('phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{currentProfile.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <h4 className="text-md font-semibold text-gray-900 mt-8">Address</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentProfile.address.street}
                      onChange={(e) => updateEditedProfile('address.street', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">{currentProfile.address.street}</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentProfile.address.city}
                        onChange={(e) => updateEditedProfile('address.city', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">{currentProfile.address.city}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentProfile.address.state}
                        onChange={(e) => updateEditedProfile('address.state', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">{currentProfile.address.state}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentProfile.address.zipCode}
                        onChange={(e) => updateEditedProfile('address.zipCode', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">{currentProfile.address.zipCode}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Emergency Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentProfile.emergencyContact.name}
                      onChange={(e) => updateEditedProfile('emergencyContact.name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">{currentProfile.emergencyContact.name}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  {isEditing ? (
                    <select
                      value={currentProfile.emergencyContact.relationship}
                      onChange={(e) => updateEditedProfile('emergencyContact.relationship', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">{currentProfile.emergencyContact.relationship}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={currentProfile.emergencyContact.phone}
                      onChange={(e) => updateEditedProfile('emergencyContact.phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">{currentProfile.emergencyContact.phone}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={currentProfile.emergencyContact.email}
                      onChange={(e) => updateEditedProfile('emergencyContact.email', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">{currentProfile.emergencyContact.email}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Communication Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Communication Method</label>
                  {isEditing ? (
                    <select
                      value={currentProfile.preferences.communicationMethod}
                      onChange={(e) => updateEditedProfile('preferences.communicationMethod', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="EMAIL">Email</option>
                      <option value="SMS">SMS/Text</option>
                      <option value="PHONE">Phone Call</option>
                      <option value="ALL">All Methods</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">{currentProfile.preferences.communicationMethod}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  {isEditing ? (
                    <select
                      value={currentProfile.preferences.language}
                      onChange={(e) => updateEditedProfile('preferences.language', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">{currentProfile.preferences.language}</div>
                  )}
                </div>
              </div>

              <h4 className="text-md font-semibold text-gray-900 mt-8">Notification Settings</h4>
              <div className="space-y-4">
                {Object.entries(currentProfile.preferences.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h5 className="font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {key === 'academicUpdates' && 'Receive notifications about academic progress and achievements'}
                        {key === 'feeReminders' && 'Get reminders about upcoming fee payments and due dates'}
                        {key === 'eventNotifications' && 'Stay informed about school events and activities'}
                        {key === 'emergencyAlerts' && 'Receive immediate alerts for emergency situations'}
                      </p>
                    </div>
                    {isEditing ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateEditedProfile(`preferences.notifications.${key}`, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {value ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Children Tab */}
          {activeTab === 'children' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Your Children</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentProfile.children.map((child) => (
                  <div key={child.id} className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {child.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{child.name}</h4>
                        <p className="text-gray-600">{child.grade}</p>
                        <p className="text-sm text-gray-500">Roll: {child.rollNumber}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        View Academic Progress
                      </button>
                      <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        View Fee Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ParentLayout>
  );
}
