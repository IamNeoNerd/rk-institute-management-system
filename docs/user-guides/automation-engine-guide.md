# Core Automation Engine - User Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Operations Dashboard](#operations-dashboard)
4. [Automated Jobs](#automated-jobs)
5. [Manual Controls](#manual-controls)
6. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
7. [API Reference](#api-reference)
8. [Best Practices](#best-practices)

## 🎯 Overview

The Core Automation Engine is a comprehensive system that automates critical institute management tasks, reducing manual workload and ensuring consistent operations.

### Key Features
- **Automated Monthly Billing**: Generates bills for all active students automatically
- **Smart Fee Reminders**: Sends timely reminders before, on, and after due dates
- **Automated Reports**: Generates financial and operational reports automatically
- **Real-time Monitoring**: Track all automation jobs and system health
- **Manual Override**: Admin can trigger any automation manually when needed

### Benefits
- ⏰ **Time Savings**: Reduces manual work by 80%
- 📈 **Improved Collections**: Timely reminders increase payment rates
- 📊 **Better Insights**: Automated reports provide regular business intelligence
- 🔄 **Consistency**: Eliminates human errors in routine tasks
- 🎛️ **Control**: Full admin oversight and manual override capabilities

## 🚀 Getting Started

### Accessing the Operations Dashboard

1. **Login as Admin**: Use your admin credentials to access the system
2. **Navigate to Operations**: Click on "Operations" in the admin sidebar
3. **Dashboard Overview**: You'll see the main automation control center

### First Time Setup

The automation system is **pre-configured** and starts working immediately:
- All scheduled jobs are automatically initialized
- Monthly billing runs on the 5th of every month at 10 AM
- Fee reminders run daily at scheduled times
- Reports generate automatically on their schedules

**No additional setup required!** ✅

## 🎛️ Operations Dashboard

### Dashboard Layout

The Operations Dashboard has three main tabs:

#### 1. **Overview Tab** 📊
- **System Status**: Real-time health of automation components
- **Quick Actions**: Manual trigger buttons for immediate execution
- **Running Jobs**: Currently executing automation tasks
- **Scheduled Jobs**: All configured automated tasks with schedules

#### 2. **Fee Reminders Tab** 📧
- **Manual Reminder Controls**: Send reminders immediately
- **Reminder Types**: Early, Due Date, and Overdue reminders
- **Automated Schedule**: View when reminders are sent automatically

#### 3. **Reports Tab** 📈
- **Manual Report Generation**: Create reports on-demand
- **Report Types**: Weekly, Monthly, and Outstanding Dues reports
- **Automated Schedule**: View when reports are generated automatically

### System Status Indicators

| **Indicator** | **Meaning** |
|---------------|-------------|
| 🟢 Green | System operational and healthy |
| 🟡 Yellow | System running with minor issues |
| 🔴 Red | System error - requires attention |

## ⚙️ Automated Jobs

### Monthly Billing Generation
- **Schedule**: 5th of every month at 10:00 AM
- **Function**: Creates fee allocations for all active students
- **Process**: 
  1. Finds all active students
  2. Calculates monthly fees using existing fee structure
  3. Creates StudentFeeAllocation records
  4. Sends bill generation notifications to families
- **Duration**: ~1-2 minutes for 100 students

### Fee Reminder System

#### Early Fee Reminders
- **Schedule**: Daily at 9:00 AM
- **Target**: Students with fees due in 3 days
- **Purpose**: Proactive notification to prevent late payments

#### Due Date Reminders
- **Schedule**: Daily at 10:00 AM
- **Target**: Students with fees due today
- **Purpose**: Same-day payment reminder

#### Overdue Reminders
- **Schedule**: Daily at 11:00 AM
- **Target**: Students with overdue payments
- **Purpose**: Collection follow-up and escalation

### Automated Reports

#### Weekly Reports
- **Schedule**: Every Monday at 8:00 AM
- **Content**: 
  - Weekly revenue summary
  - Payment count and averages
  - New allocations created
  - Performance metrics

#### Monthly Reports
- **Schedule**: 1st day of every month at 8:00 AM
- **Content**:
  - Total monthly revenue
  - Collection rates and efficiency
  - New student enrollments
  - Outstanding dues summary

#### Outstanding Dues Reports
- **Schedule**: Every Wednesday at 8:00 AM
- **Content**:
  - Total overdue amounts
  - Family-wise breakdown
  - Aging analysis
  - Collection priorities

## 🎮 Manual Controls

### Triggering Jobs Manually

#### From Operations Dashboard:
1. Navigate to the appropriate tab (Overview/Reminders/Reports)
2. Click the desired action button
3. Wait for confirmation message
4. Check execution results in system logs

#### Available Manual Actions:

**Monthly Billing**
```
Button: "Trigger Monthly Billing"
Use Case: Generate bills outside regular schedule
Warning: Avoid duplicate billing for same month
```

**Fee Reminders**
```
Buttons: "Early Reminders", "Due Date Reminders", "Overdue Reminders"
Use Case: Send immediate reminders for collections
Safe: Can be run multiple times without issues
```

**Reports**
```
Buttons: "Weekly Report", "Monthly Report", "Outstanding Dues"
Use Case: Generate reports for immediate analysis
Output: Check server logs for report details
```

### Manual Trigger Best Practices

1. **Check Current Status**: Ensure no similar job is already running
2. **Verify Data**: Confirm student data is up-to-date before billing
3. **Monitor Execution**: Watch for completion confirmation
4. **Review Results**: Check logs for any errors or issues
5. **Document Actions**: Note manual triggers for audit purposes

## 🔍 Monitoring & Troubleshooting

### Real-time Monitoring

#### System Health Check
- **Location**: Operations Dashboard > Overview Tab
- **Frequency**: Updates every 30 seconds
- **Components**: Automation Engine, Scheduler, Database connectivity

#### Job Execution Tracking
- **Running Jobs**: Shows currently executing tasks
- **Execution Time**: Displays how long jobs take to complete
- **Success/Failure**: Clear indicators of job outcomes

### Common Issues & Solutions

#### Issue: Monthly Billing Not Generated
**Symptoms**: No new fee allocations on 5th of month
**Solutions**:
1. Check if bills already exist for current month
2. Verify active students in system
3. Manually trigger billing from dashboard
4. Check server logs for error details

#### Issue: Reminders Not Sending
**Symptoms**: No notification logs in console
**Solutions**:
1. Verify student family contact information
2. Check due dates are properly set
3. Manually trigger specific reminder type
4. Review notification service logs

#### Issue: Reports Not Generating
**Symptoms**: No report data in logs
**Solutions**:
1. Check database connectivity
2. Verify payment and allocation data exists
3. Manually trigger report generation
4. Review report service error logs

### Log Monitoring

#### Server Console Logs
```
[Automation Engine] Monthly billing completed: 11/11 students processed
[Scheduler Service] Started job: Monthly Billing Generation
[Notification Service] Sent fee reminder to The Sharma Family
```

#### Key Log Patterns to Watch:
- ✅ `✅ Completed successfully` - Job finished without errors
- ❌ `❌ Failed` - Job encountered errors
- 🔄 `Starting job` - Job execution began
- 📊 `Generated report` - Report creation completed

## 🔌 API Reference

### Automation Status
```http
GET /api/automation/status
```
Returns current system status and running jobs.

### Monthly Billing
```http
POST /api/automation/monthly-billing
Content-Type: application/json

{
  "month": 6,    // Optional: specific month
  "year": 2025   // Optional: specific year
}
```

### Fee Reminders
```http
POST /api/automation/fee-reminders
Content-Type: application/json

{
  "reminderType": "overdue"  // "early", "due", or "overdue"
}
```

### Report Generation
```http
POST /api/automation/reports
Content-Type: application/json

{
  "reportType": "monthly"  // "weekly", "monthly", or "outstanding"
}
```

### Health Check
```http
GET /api/health/automation
```
Returns detailed health status of automation components.

## 📋 Best Practices

### For Administrators

#### Daily Operations
1. **Morning Check**: Review overnight automation results
2. **Monitor Dashboard**: Check system status indicators
3. **Review Notifications**: Ensure reminders are being sent
4. **Handle Exceptions**: Address any failed jobs promptly

#### Monthly Operations
1. **Pre-Billing Review**: Verify student data before 5th of month
2. **Post-Billing Check**: Confirm all bills generated correctly
3. **Collection Analysis**: Review outstanding dues reports
4. **Performance Review**: Analyze monthly automation metrics

#### Best Practices
- ✅ **Regular Monitoring**: Check dashboard daily
- ✅ **Data Hygiene**: Keep student information updated
- ✅ **Backup Awareness**: Understand manual override procedures
- ✅ **Documentation**: Log any manual interventions
- ❌ **Avoid Duplicates**: Don't run same job multiple times
- ❌ **Don't Ignore Errors**: Address failed jobs immediately

### For Technical Users

#### System Maintenance
1. **Log Rotation**: Monitor and manage log file sizes
2. **Performance Monitoring**: Track job execution times
3. **Database Health**: Ensure optimal database performance
4. **Backup Verification**: Confirm automation data is backed up

#### Troubleshooting Steps
1. **Check Logs**: Always start with server console logs
2. **Verify Data**: Ensure underlying data integrity
3. **Test Manually**: Use manual triggers to isolate issues
4. **Monitor Resources**: Check system resource usage
5. **Escalate Properly**: Know when to involve technical support

## 🆘 Support & Contact

### Getting Help
- **Dashboard Issues**: Use manual triggers as temporary solution
- **Data Problems**: Verify student and family information
- **Technical Errors**: Check server logs for detailed error messages
- **Performance Issues**: Monitor system resource usage

### Emergency Procedures
1. **Critical Billing Issue**: Use manual monthly billing trigger
2. **Reminder System Down**: Send manual reminders via dashboard
3. **Report Generation Failed**: Trigger reports manually
4. **System Unresponsive**: Restart automation services if needed

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Core automation engine implementation
- ✅ 7 automated job types
- ✅ Operations dashboard with tabbed interface
- ✅ Manual trigger capabilities
- ✅ Real-time monitoring and status
- ✅ Comprehensive API endpoints
- ✅ Notification service foundation

### Upcoming Features
- 🔄 Email integration for notifications
- 🔄 Advanced scheduling options
- 🔄 Report storage and history
- 🔄 Performance analytics dashboard
- 🔄 Mobile app notifications

---

*This guide covers the Core Automation Engine module. For other system features, please refer to the main system documentation.*
