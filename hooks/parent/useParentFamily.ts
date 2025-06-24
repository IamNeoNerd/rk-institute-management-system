/**
 * Parent Family Hook
 * 
 * Specialized hook for managing parent family data including children,
 * family profile, emergency contacts, and family settings.
 * 
 * Features:
 * - Children information and academic progress
 * - Family profile management
 * - Emergency contact management
 * - Family settings and preferences
 * - Child-specific data filtering
 */

'use client';

import { useState, useCallback } from 'react';
import { Child, FamilyProfile, EmergencyContact, ChildAcademicProgress } from '@/components/features/parent-portal/types';

export interface UseParentFamilyReturn {
  // Data State
  children: Child[];
  selectedChildData: Child | null;
  childrenProgress: ChildAcademicProgress[];
  emergencyContacts: EmergencyContact[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchChildren: () => Promise<void>;
  fetchChildProgress: (childId: string) => Promise<ChildAcademicProgress | null>;
  fetchAllChildrenProgress: () => Promise<void>;
  updateFamilyProfile: (updates: Partial<FamilyProfile>) => Promise<boolean>;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => Promise<boolean>;
  updateEmergencyContact: (id: string, updates: Partial<EmergencyContact>) => Promise<boolean>;
  deleteEmergencyContact: (id: string) => Promise<boolean>;
  getChildById: (childId: string) => Child | null;
  getChildProgressById: (childId: string) => ChildAcademicProgress | null;
}

export function useParentFamily(): UseParentFamilyReturn {
  // Data State
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildData, setSelectedChildData] = useState<Child | null>(null);
  const [childrenProgress, setChildrenProgress] = useState<ChildAcademicProgress[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch children
  const fetchChildren = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/parents/children', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setChildren(data.children || []);
      } else {
        setError('Failed to fetch children');
      }
    } catch (err) {
      setError('Network error while fetching children');
      console.error('Error fetching children:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch child progress
  const fetchChildProgress = useCallback(async (childId: string): Promise<ChildAcademicProgress | null> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/parents/children/${childId}/progress`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.progress;
      } else {
        setError('Failed to fetch child progress');
        return null;
      }
    } catch (err) {
      setError('Network error while fetching child progress');
      console.error('Error fetching child progress:', err);
      return null;
    }
  }, []);

  // Fetch all children progress
  const fetchAllChildrenProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/parents/children/progress', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setChildrenProgress(data.progress || []);
      } else {
        setError('Failed to fetch children progress');
      }
    } catch (err) {
      setError('Network error while fetching children progress');
      console.error('Error fetching children progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update family profile
  const updateFamilyProfile = useCallback(async (updates: Partial<FamilyProfile>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/parents/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        return true;
      } else {
        setError('Failed to update family profile');
        return false;
      }
    } catch (err) {
      setError('Network error while updating family profile');
      console.error('Error updating family profile:', err);
      return false;
    }
  }, []);

  // Add emergency contact
  const addEmergencyContact = useCallback(async (contact: Omit<EmergencyContact, 'id'>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/parents/emergency-contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
      });

      if (response.ok) {
        const newContact = await response.json();
        setEmergencyContacts(prev => [...prev, newContact]);
        return true;
      } else {
        setError('Failed to add emergency contact');
        return false;
      }
    } catch (err) {
      setError('Network error while adding emergency contact');
      console.error('Error adding emergency contact:', err);
      return false;
    }
  }, []);

  // Update emergency contact
  const updateEmergencyContact = useCallback(async (id: string, updates: Partial<EmergencyContact>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/parents/emergency-contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedContact = await response.json();
        setEmergencyContacts(prev => prev.map(contact => 
          contact.id === id ? updatedContact : contact
        ));
        return true;
      } else {
        setError('Failed to update emergency contact');
        return false;
      }
    } catch (err) {
      setError('Network error while updating emergency contact');
      console.error('Error updating emergency contact:', err);
      return false;
    }
  }, []);

  // Delete emergency contact
  const deleteEmergencyContact = useCallback(async (id: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/parents/emergency-contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setEmergencyContacts(prev => prev.filter(contact => contact.id !== id));
        return true;
      } else {
        setError('Failed to delete emergency contact');
        return false;
      }
    } catch (err) {
      setError('Network error while deleting emergency contact');
      console.error('Error deleting emergency contact:', err);
      return false;
    }
  }, []);

  // Get child by ID
  const getChildById = useCallback((childId: string): Child | null => {
    return children.find(child => child.id === childId) || null;
  }, [children]);

  // Get child progress by ID
  const getChildProgressById = useCallback((childId: string): ChildAcademicProgress | null => {
    return childrenProgress.find(progress => progress.childId === childId) || null;
  }, [childrenProgress]);

  return {
    // Data State
    children,
    selectedChildData,
    childrenProgress,
    emergencyContacts,
    loading,
    error,
    
    // Actions
    fetchChildren,
    fetchChildProgress,
    fetchAllChildrenProgress,
    updateFamilyProfile,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    getChildById,
    getChildProgressById,
  };
}
