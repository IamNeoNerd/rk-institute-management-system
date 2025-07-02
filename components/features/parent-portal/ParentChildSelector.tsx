/**
 * Parent Child Selector Component
 *
 * Provides a dropdown selector for parents with multiple children to filter
 * data and views by specific child or view all children together.
 *
 * Design Features:
 * - Conditional rendering (only shows for families with multiple children)
 * - Clean dropdown interface with child names and grades
 * - "All Children" option for combined view
 * - Professional styling consistent with RK Institute standards
 * - Focus states and accessibility support
 */

'use client';

import { ParentChildSelectorProps } from './types';

export default function ParentChildSelector({
  familyProfile,
  selectedChild,
  onChildChange
}: ParentChildSelectorProps) {
  // Only render if family has multiple children
  if (!familyProfile || familyProfile.children.length <= 1) {
    return null;
  }

  return (
    <div className='bg-white border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3'>
        <div className='flex items-center space-x-4'>
          <span className='text-sm font-medium text-gray-700'>
            View data for:
          </span>
          <select
            value={selectedChild}
            onChange={e => onChildChange(e.target.value)}
            className='border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white'
          >
            <option value='all'>All Children</option>
            {familyProfile.children.map(child => (
              <option key={child.id} value={child.id}>
                {child.name} ({child.grade})
              </option>
            ))}
          </select>

          {/* Child Count Badge */}
          <div className='ml-4 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full'>
            {familyProfile.children.length}{' '}
            {familyProfile.children.length === 1 ? 'Child' : 'Children'}
          </div>
        </div>
      </div>
    </div>
  );
}
