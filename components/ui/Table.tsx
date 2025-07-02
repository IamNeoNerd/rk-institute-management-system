/**
 * Table Component - UI Library
 *
 * Reusable table component with industry-standard features for data display.
 * Provides consistent styling, sorting, pagination, and responsive behavior.
 *
 * Design Features:
 * - Responsive design with mobile-optimized layouts
 * - Sortable columns with visual indicators
 * - Loading states and empty state handling
 * - Professional styling with hover effects
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Touch-friendly mobile interactions
 */

import React, { useState, useMemo, memo, useCallback } from 'react';

import { cn } from '@/lib/utils';

import { ProfessionalIcon } from './icons/ProfessionalIconSystem';
import { EmptyState, LoadingState } from './States';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
  mobileHidden?: boolean;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  empty?: {
    title?: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: string | ((record: T) => string);
  onRow?: (
    record: T,
    index: number
  ) => {
    onClick?: () => void;
    className?: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  mobileOptimized?: boolean;
}

type SortOrder = 'asc' | 'desc' | null;

export function Table<T = any>({
  columns,
  data,
  loading = false,
  empty,
  pagination,
  rowKey = 'id',
  onRow,
  className,
  size = 'md',
  bordered = true,
  striped = true,
  hoverable = true,
  mobileOptimized = true
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortOrder(
        sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? null : 'asc'
      );
    } else {
      setSortColumn(columnKey);
      setSortOrder('asc');
    }
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortOrder) return data;

    const column = columns.find(col => col.key === sortColumn);
    if (!column || !column.sortable) return data;

    return [...data].sort((a, b) => {
      const aValue = column.dataIndex
        ? (a as any)[column.dataIndex]
        : (a as any)[sortColumn];
      const bValue = column.dataIndex
        ? (b as any)[column.dataIndex]
        : (b as any)[sortColumn];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortOrder, columns]);

  // Get row key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return (record[rowKey as keyof T] as string) || index.toString();
  };

  // Size variants
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  };

  const cellPadding = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  };

  if (loading) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <LoadingState message='Loading data...' />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <EmptyState
          title={empty?.title || 'No data available'}
          description={empty?.description || 'There are no records to display.'}
          action={empty?.action}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl overflow-hidden',
        bordered && 'border border-gray-200',
        className
      )}
    >
      {/* Desktop Table */}
      <div
        className={cn('overflow-x-auto', mobileOptimized && 'hidden sm:block')}
      >
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={cn(
                    'font-semibold text-gray-900 text-left',
                    cellPadding[size],
                    sizeClasses[size],
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable &&
                      'cursor-pointer hover:bg-gray-100 transition-colors',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className='flex items-center space-x-2'>
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className='flex flex-col'>
                        <ProfessionalIcon
                          name='arrow-up-right'
                          size={12}
                          className={cn(
                            'transition-colors',
                            sortColumn === column.key && sortOrder === 'asc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          )}
                        />
                        <ProfessionalIcon
                          name='arrow-down-right'
                          size={12}
                          className={cn(
                            'transition-colors -mt-1',
                            sortColumn === column.key && sortOrder === 'desc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((record, index) => {
              const rowProps = onRow?.(record, index) || {};
              return (
                <tr
                  key={getRowKey(record, index)}
                  className={cn(
                    'border-b border-gray-100 last:border-b-0',
                    striped && index % 2 === 1 && 'bg-gray-50/50',
                    hoverable && 'hover:bg-blue-50/50 transition-colors',
                    rowProps.onClick && 'cursor-pointer',
                    rowProps.className
                  )}
                  onClick={rowProps.onClick}
                >
                  {columns.map(column => {
                    const value = column.dataIndex
                      ? (record as any)[column.dataIndex]
                      : (record as any)[column.key];
                    const content = column.render
                      ? column.render(value, record, index)
                      : value;

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          'text-gray-900',
                          cellPadding[size],
                          sizeClasses[size],
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.className
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      {mobileOptimized && (
        <div className='sm:hidden divide-y divide-gray-200'>
          {sortedData.map((record, index) => {
            const rowProps = onRow?.(record, index) || {};
            return (
              <div
                key={getRowKey(record, index)}
                className={cn(
                  'p-4 space-y-3',
                  hoverable && 'hover:bg-blue-50/50 transition-colors',
                  rowProps.onClick && 'cursor-pointer',
                  rowProps.className
                )}
                onClick={rowProps.onClick}
              >
                {columns
                  .filter(column => !column.mobileHidden)
                  .map(column => {
                    const value = column.dataIndex
                      ? (record as any)[column.dataIndex]
                      : (record as any)[column.key];
                    const content = column.render
                      ? column.render(value, record, index)
                      : value;

                    return (
                      <div
                        key={column.key}
                        className='flex justify-between items-start'
                      >
                        <span className='text-sm font-medium text-gray-600 flex-shrink-0 mr-3'>
                          {column.title}:
                        </span>
                        <span className='text-sm text-gray-900 text-right flex-1'>
                          {content}
                        </span>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <div className='px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between'>
          <div className='text-sm text-gray-700'>
            Showing {(pagination.current - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(
              pagination.current * pagination.pageSize,
              pagination.total
            )}{' '}
            of {pagination.total} results
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() =>
                pagination.onChange(pagination.current - 1, pagination.pageSize)
              }
              disabled={pagination.current <= 1}
              className='px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Previous
            </button>
            <span className='text-sm text-gray-700'>
              Page {pagination.current} of{' '}
              {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              onClick={() =>
                pagination.onChange(pagination.current + 1, pagination.pageSize)
              }
              disabled={
                pagination.current >=
                Math.ceil(pagination.total / pagination.pageSize)
              }
              className='px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export memoized component for performance optimization
export default memo(Table);
