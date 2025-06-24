/**
 * Report Template List Component
 * 
 * Displays available report templates with filtering and selection capabilities.
 * Leverages existing UI components for rapid development and consistency.
 * 
 * Features:
 * - Template categorization and filtering
 * - Role-based template visibility
 * - Search and sort functionality
 * - Professional card-based layout
 * - Reuses existing Grid, Card, and Button components
 */

'use client';

import React, { useState, useMemo } from 'react';
import { ReportTemplateListProps, ReportTemplate } from './types';
import { Grid, Card, Button, LoadingState } from '@/components/ui';

export default function ReportTemplateList({
  templates,
  userRole,
  onSelectTemplate,
  loading = false
}: ReportTemplateListProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter templates based on user role, search, and category
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Role-based filtering
      if (!template.userRoles.includes(userRole as any)) return false;
      
      // Search filtering
      if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !template.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Category filtering
      if (selectedCategory !== 'all' && template.category !== selectedCategory) {
        return false;
      }
      
      return template.isActive;
    });
  }, [templates, userRole, searchTerm, selectedCategory]);

  // Category options for filtering
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'academic', label: 'Academic Reports' },
    { value: 'financial', label: 'Financial Reports' },
    { value: 'attendance', label: 'Attendance Reports' },
    { value: 'performance', label: 'Performance Reports' },
    { value: 'custom', label: 'Custom Reports' }
  ];

  // Category icons and colors
  const getCategoryIcon = (category: string) => {
    const icons = {
      academic: '📚',
      financial: '💰',
      attendance: '📅',
      performance: '📊',
      custom: '⚙️'
    };
    return icons[category as keyof typeof icons] || '📄';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800',
      financial: 'bg-green-100 text-green-800',
      attendance: 'bg-purple-100 text-purple-800',
      performance: 'bg-orange-100 text-orange-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <LoadingState message="Loading report templates..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Templates</h2>
        <p className="text-gray-600">
          Generate comprehensive reports for academic, financial, and performance analysis
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search report templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No report templates are available for your role'
            }
          </p>
        </div>
      ) : (
        <Grid cols={3} responsive={{ sm: 1, md: 2, lg: 3 }}>
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Template Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-3xl mr-3">
                      {getCategoryIcon(template.category)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {template.name}
                      </h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Template Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {template.description}
                </p>

                {/* Template Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">⏱️</span>
                    <span>~{template.estimatedTime}s generation time</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">📄</span>
                    <span>{template.outputFormats.join(', ').toUpperCase()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">⚙️</span>
                    <span>{template.parameters.length} parameters</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => onSelectTemplate(template)}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  Generate Report
                </Button>
              </div>
            </Card>
          ))}
        </Grid>
      )}

      {/* Summary Stats */}
      {filteredTemplates.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredTemplates.length} of {templates.length} templates
            </span>
            <span>
              Available for {userRole} role
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
