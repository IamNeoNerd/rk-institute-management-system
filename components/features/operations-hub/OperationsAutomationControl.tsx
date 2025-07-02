/**
 * Operations Automation Control Component
 *
 * Handles all automation job triggering and control functionality.
 * Provides different interfaces based on the active tab (overview, reminders, reports).
 *
 * Design Features:
 * - Tab-based conditional rendering
 * - Color-coded action buttons with loading states
 * - Professional gradient button styling
 * - Comprehensive job triggering controls
 * - Automated schedule information display
 */

'use client';

import { Button, Grid, Card } from '@/components/ui';
import { ProfessionalIcon } from '@/components/ui/icons/ProfessionalIconSystem';

import {
  OperationsAutomationControlProps,
  ActiveTab,
  ReminderType,
  ReportType
} from './types';

export default function OperationsAutomationControl({
  automationStatus,
  triggeringJob,
  activeTab,
  onTriggerMonthlyBilling,
  onTriggerFeeReminder,
  onTriggerReport
}: OperationsAutomationControlProps) {
  if (!automationStatus) return null;

  return (
    <div className='space-y-6'>
      {/* Overview Tab - Quick Actions */}
      {activeTab === 'overview' && (
        <Card>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            Quick Actions
          </h2>
          <Grid cols={3} responsive={{ sm: 1, md: 2, lg: 3 }}>
            <Button
              onClick={onTriggerMonthlyBilling}
              loading={triggeringJob === 'monthly-billing'}
              variant='primary'
              className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-20 flex-col'
              fullWidth
            >
              {triggeringJob === 'monthly-billing'
                ? 'Generating Bills...'
                : 'Trigger Monthly Billing'}
            </Button>

            <Button
              onClick={() => onTriggerFeeReminder('overdue')}
              loading={triggeringJob === 'fee-reminder-overdue'}
              className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-20 flex-col text-white'
              fullWidth
            >
              {triggeringJob === 'fee-reminder-overdue'
                ? 'Sending Reminders...'
                : 'Send Overdue Reminders'}
            </Button>

            <Button
              onClick={() => onTriggerReport('monthly')}
              loading={triggeringJob === 'report-monthly'}
              className='bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 h-20 flex-col text-white'
              fullWidth
            >
              {triggeringJob === 'report-monthly'
                ? 'Generating Report...'
                : 'Generate Monthly Report'}
            </Button>
          </Grid>
        </Card>
      )}

      {/* Reminders Tab - Fee Reminder Controls */}
      {activeTab === 'reminders' && (
        <>
          <Card>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Fee Reminder Management
            </h2>
            <Grid cols={3} responsive={{ sm: 1, md: 3 }}>
              <Button
                onClick={() => onTriggerFeeReminder('early')}
                loading={triggeringJob === 'fee-reminder-early'}
                className='bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 h-24 flex-col text-white'
                fullWidth
              >
                {triggeringJob === 'fee-reminder-early' ? (
                  'Sending...'
                ) : (
                  <>
                    <div className='text-lg mb-1'>
                      <ProfessionalIcon name='calendar' size={24} />
                    </div>
                    <div>Early Reminders</div>
                    <div className='text-xs opacity-80'>3 days before due</div>
                  </>
                )}
              </Button>

              <Button
                onClick={() => onTriggerFeeReminder('due')}
                loading={triggeringJob === 'fee-reminder-due'}
                className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-24 flex-col text-white'
                fullWidth
              >
                {triggeringJob === 'fee-reminder-due' ? (
                  'Sending...'
                ) : (
                  <>
                    <div className='text-lg mb-1'>
                      <ProfessionalIcon name='clock' size={24} />
                    </div>
                    <div>Due Date Reminders</div>
                    <div className='text-xs opacity-80'>Due today</div>
                  </>
                )}
              </Button>

              <Button
                onClick={() => onTriggerFeeReminder('overdue')}
                loading={triggeringJob === 'fee-reminder-overdue'}
                className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 h-24 flex-col text-white'
                fullWidth
              >
                {triggeringJob === 'fee-reminder-overdue' ? (
                  'Sending...'
                ) : (
                  <>
                    <div className='text-lg mb-1'>
                      <ProfessionalIcon name='alert' size={24} />
                    </div>
                    <div>Overdue Reminders</div>
                    <div className='text-xs opacity-80'>Past due date</div>
                  </>
                )}
              </Button>
            </Grid>
          </Card>

          {/* Reminder Schedule */}
          <Card>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Automated Reminder Schedule
            </h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200'>
                <div>
                  <h3 className='font-semibold text-yellow-800'>
                    Early Fee Reminders
                  </h3>
                  <p className='text-sm text-yellow-600'>
                    Daily at 9:00 AM - 3 days before due date
                  </p>
                </div>
                <div className='text-yellow-600'>📅</div>
              </div>
              <div className='flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200'>
                <div>
                  <h3 className='font-semibold text-blue-800'>
                    Due Date Reminders
                  </h3>
                  <p className='text-sm text-blue-600'>
                    Daily at 10:00 AM - on due date
                  </p>
                </div>
                <div className='text-blue-600'>⏰</div>
              </div>
              <div className='flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200'>
                <div>
                  <h3 className='font-semibold text-red-800'>
                    Overdue Reminders
                  </h3>
                  <p className='text-sm text-red-600'>
                    Daily at 11:00 AM - for overdue payments
                  </p>
                </div>
                <div className='text-red-600'>🚨</div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Reports Tab - Report Generation Controls */}
      {activeTab === 'reports' && (
        <>
          <Card>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Report Generation
            </h2>
            <Grid cols={3} responsive={{ sm: 1, md: 3 }}>
              <Button
                onClick={() => onTriggerReport('weekly')}
                loading={triggeringJob === 'report-weekly'}
                className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-24 flex-col text-white'
                fullWidth
              >
                {triggeringJob === 'report-weekly' ? (
                  'Generating...'
                ) : (
                  <>
                    <div className='text-lg mb-1'>
                      <ProfessionalIcon name='analytics' size={24} />
                    </div>
                    <div>Weekly Report</div>
                    <div className='text-xs opacity-80'>Last 7 days</div>
                  </>
                )}
              </Button>

              <Button
                onClick={() => onTriggerReport('monthly')}
                loading={triggeringJob === 'report-monthly'}
                className='bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 h-24 flex-col text-white'
                fullWidth
              >
                {triggeringJob === 'report-monthly' ? (
                  'Generating...'
                ) : (
                  <>
                    <div className='text-lg mb-1'>
                      <ProfessionalIcon name='trending-up' size={24} />
                    </div>
                    <div>Monthly Report</div>
                    <div className='text-xs opacity-80'>Current month</div>
                  </>
                )}
              </Button>

              <Button
                onClick={() => onTriggerReport('outstanding')}
                loading={triggeringJob === 'report-outstanding'}
                className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-24 flex-col text-white'
                fullWidth
              >
                {triggeringJob === 'report-outstanding' ? (
                  'Generating...'
                ) : (
                  <>
                    <div className='text-lg mb-1'>
                      <ProfessionalIcon name='money' size={24} />
                    </div>
                    <div>Outstanding Dues</div>
                    <div className='text-xs opacity-80'>Overdue payments</div>
                  </>
                )}
              </Button>
            </Grid>
          </Card>

          {/* Report Schedule */}
          <Card>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Automated Report Schedule
            </h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200'>
                <div>
                  <h3 className='font-semibold text-green-800'>
                    Weekly Reports
                  </h3>
                  <p className='text-sm text-green-600'>
                    Every Monday at 8:00 AM
                  </p>
                </div>
                <div className='text-green-600'>📊</div>
              </div>
              <div className='flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200'>
                <div>
                  <h3 className='font-semibold text-purple-800'>
                    Monthly Reports
                  </h3>
                  <p className='text-sm text-purple-600'>
                    1st day of every month at 8:00 AM
                  </p>
                </div>
                <div className='text-purple-600'>📈</div>
              </div>
              <div className='flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200'>
                <div>
                  <h3 className='font-semibold text-orange-800'>
                    Outstanding Dues Reports
                  </h3>
                  <p className='text-sm text-orange-600'>
                    Every Wednesday at 8:00 AM
                  </p>
                </div>
                <div className='text-orange-600'>💰</div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
