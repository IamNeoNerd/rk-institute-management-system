'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ParentLayout from '@/components/layout/ParentLayout';
import { HubHeader, HubActionButton } from '@/components/hub';
import ProfessionalMetricCard from '@/components/cards/ProfessionalMetricCard';
import { FileText, Plus, Edit, Trash2, Phone, Mail, User } from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  isPrimary: boolean;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// SSR-Safe Search Params Component
function EmergencyContactsContent() {
  const searchParams = useSearchParams();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    isPrimary: false,
    notes: ''
  });

  useEffect(() => {
    // Handle query parameters safely
    try {
      const action = searchParams?.get('action');

      if (action === 'add') {
        setShowForm(true);
      }
    } catch (error) {
      // Handle SSR or navigation errors gracefully
      console.warn('Search params not available:', error);
    }

    // Mock data for emergency contacts
    setContacts([
      {
        id: '1',
        name: 'John Wilson',
        relationship: 'Father',
        phone: '+1 (555) 987-6543',
        email: 'john.wilson@email.com',
        address: {
          street: '123 Oak Street',
          city: 'Springfield',
          state: 'Illinois',
          zipCode: '62701'
        },
        isPrimary: true,
        isActive: true,
        notes: 'Primary emergency contact. Available 24/7.',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-06-01T14:20:00Z'
      },
      {
        id: '2',
        name: 'Margaret Wilson',
        relationship: 'Grandmother',
        phone: '+1 (555) 456-7890',
        email: 'margaret.wilson@email.com',
        address: {
          street: '456 Elm Avenue',
          city: 'Springfield',
          state: 'Illinois',
          zipCode: '62702'
        },
        isPrimary: false,
        isActive: true,
        notes: 'Lives nearby. Can pick up children if needed.',
        createdAt: '2024-01-15T10:35:00Z',
        updatedAt: '2024-05-15T09:10:00Z'
      },
      {
        id: '3',
        name: 'Dr. Emily Chen',
        relationship: 'Family Doctor',
        phone: '+1 (555) 123-9876',
        email: 'dr.chen@springfieldmedical.com',
        address: {
          street: '789 Medical Plaza',
          city: 'Springfield',
          state: 'Illinois',
          zipCode: '62703'
        },
        isPrimary: false,
        isActive: true,
        notes: 'Family physician. Contact for medical emergencies.',
        createdAt: '2024-02-01T11:00:00Z',
        updatedAt: '2024-04-20T16:30:00Z'
      },
      {
        id: '4',
        name: 'Robert Smith',
        relationship: 'Family Friend',
        phone: '+1 (555) 789-0123',
        email: 'robert.smith@email.com',
        address: {
          street: '321 Pine Street',
          city: 'Springfield',
          state: 'Illinois',
          zipCode: '62704'
        },
        isPrimary: false,
        isActive: true,
        notes: 'Close family friend. Available during work hours.',
        createdAt: '2024-03-10T15:45:00Z',
        updatedAt: '2024-05-30T12:15:00Z'
      }
    ]);

    setLoading(false);
  }, [searchParams]);

  const activeContacts = contacts.filter(contact => contact.isActive);
  const primaryContact = contacts.find(contact => contact.isPrimary);
  const totalContacts = contacts.length;
  const recentlyUpdated = contacts.filter(contact => 
    new Date(contact.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  const handleSubmit = () => {
    const newContact: EmergencyContact = {
      id: editingContact ? editingContact.id : Date.now().toString(),
      ...formData,
      isActive: true,
      createdAt: editingContact ? editingContact.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingContact) {
      setContacts(contacts.map(contact => 
        contact.id === editingContact.id ? newContact : contact
      ));
    } else {
      setContacts([newContact, ...contacts]);
    }

    resetForm();
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email,
      address: contact.address,
      isPrimary: contact.isPrimary,
      notes: contact.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = (contactId: string) => {
    if (confirm('Are you sure you want to delete this emergency contact?')) {
      setContacts(contacts.filter(contact => contact.id !== contactId));
    }
  };

  const handleSetPrimary = (contactId: string) => {
    setContacts(contacts.map(contact => ({
      ...contact,
      isPrimary: contact.id === contactId
    })));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      isPrimary: false,
      notes: ''
    });
    setEditingContact(null);
    setShowForm(false);
  };

  const updateFormData = (field: string, value: any) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setFormData({ ...formData, [field]: value });
    } else {
      setFormData({
        ...formData,
        [keys[0]]: {
          ...(formData[keys[0] as keyof typeof formData] as object),
          [keys[1]]: value
        }
      });
    }
  };

  if (loading) {
    return (
      <ParentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading emergency contacts...</div>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="space-y-8">
        <HubHeader
          title="Emergency Contacts Management"
          subtitle="Manage emergency contacts for your family's safety and security"
          actions={
            <>
              <HubActionButton href="/parent/dashboard" icon={FileText} label="Back to Dashboard" color="gray" />
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalMetricCard
            title="Total Contacts"
            value={totalContacts}
            subtitle="Emergency contacts"
            icon="users"
            color="blue"
          />
          <ProfessionalMetricCard
            title="Active Contacts"
            value={activeContacts.length}
            subtitle="Currently active"
            icon="user-check"
            color="green"
          />
          <ProfessionalMetricCard
            title="Primary Contact"
            value={primaryContact ? primaryContact.name : 'None'}
            subtitle="Main emergency contact"
            icon="user-star"
            color="purple"
          />
          <ProfessionalMetricCard
            title="Recently Updated"
            value={recentlyUpdated}
            subtitle="Last 30 days"
            icon="clock"
            color="orange"
          />
        </div>

        {/* Emergency Contacts List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Emergency Contacts</h3>
          
          {activeContacts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Emergency Contacts</h3>
              <p className="text-gray-600 mb-4">Add emergency contacts to ensure your family&apos;s safety.</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Contact
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeContacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className={`bg-white rounded-xl border-2 p-6 hover:shadow-md transition-shadow ${
                    contact.isPrimary ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                        <p className="text-gray-600">{contact.relationship}</p>
                        {contact.isPrimary && (
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Primary Contact
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{contact.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{contact.email}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Address:</strong> {contact.address.street}, {contact.address.city}, {contact.address.state} {contact.address.zipCode}
                    </div>
                    {contact.notes && (
                      <div className="text-sm text-gray-600">
                        <strong>Notes:</strong> {contact.notes}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Updated: {new Date(contact.updatedAt).toLocaleDateString()}
                      </span>
                      {!contact.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(contact.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Set as Primary
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Contact Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    <select
                      value={formData.relationship}
                      onChange={(e) => updateFormData('relationship', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select relationship</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Grandmother">Grandmother</option>
                      <option value="Grandfather">Grandfather</option>
                      <option value="Aunt">Aunt</option>
                      <option value="Uncle">Uncle</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Family Friend">Family Friend</option>
                      <option value="Neighbor">Neighbor</option>
                      <option value="Family Doctor">Family Doctor</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => updateFormData('address.street', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => updateFormData('address.city', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => updateFormData('address.state', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) => updateFormData('address.zipCode', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12345"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes about this contact..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={formData.isPrimary}
                    onChange={(e) => updateFormData('isPrimary', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-900">
                    Set as primary emergency contact
                  </label>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Important Information</h4>
                  <p className="text-yellow-800 text-sm">
                    Emergency contacts will be notified in case of emergencies involving your children.
                    Please ensure all information is accurate and up-to-date. The primary contact will be contacted first.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.relationship || !formData.phone}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingContact ? 'Update Contact' : 'Add Contact'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ParentLayout>
  );
}

// Main component with Suspense wrapper for SSR safety
export default function ParentEmergencyContacts() {
  return (
    <Suspense fallback={
      <ParentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading emergency contacts...</div>
        </div>
      </ParentLayout>
    }>
      <EmergencyContactsContent />
    </Suspense>
  );
}
