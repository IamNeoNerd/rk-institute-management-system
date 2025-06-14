# Core Automation Engine - Quick Reference

## 🚀 Quick Access

- **Dashboard**: Admin → Operations
- **Manual Billing**: Overview Tab → "Trigger Monthly Billing"
- **Send Reminders**: Reminders Tab → Choose reminder type
- **Generate Reports**: Reports Tab → Choose report type

## ⏰ Automation Schedule

| **Time** | **Job**            | **Frequency** | **What It Does**           |
| -------- | ------------------ | ------------- | -------------------------- |
| 8:00 AM  | Weekly Reports     | Monday        | Performance analytics      |
| 8:00 AM  | Monthly Reports    | 1st of month  | Comprehensive metrics      |
| 8:00 AM  | Outstanding Dues   | Wednesday     | Collection management      |
| 9:00 AM  | Early Reminders    | Daily         | 3-day advance notice       |
| 10:00 AM | Due Date Reminders | Daily         | Same-day payment alerts    |
| 10:00 AM | Monthly Billing    | 5th of month  | Generate all student bills |
| 11:00 AM | Overdue Reminders  | Daily         | Collection follow-up       |

## 🎛️ Manual Controls

### Monthly Billing

```
When: Outside regular schedule or missed billing
How: Overview Tab → "Trigger Monthly Billing"
Time: ~1-2 minutes for 100 students
Warning: Check for existing bills first
```

### Fee Reminders

```
Early: Reminders Tab → "Early Reminders" (3 days before due)
Due: Reminders Tab → "Due Date Reminders" (due today)
Overdue: Reminders Tab → "Overdue Reminders" (past due)
Safe: Can run multiple times
```

### Reports

```
Weekly: Reports Tab → "Weekly Report" (last 7 days)
Monthly: Reports Tab → "Monthly Report" (current month)
Outstanding: Reports Tab → "Outstanding Dues" (overdue analysis)
Output: Check server logs for details
```

## 🔍 Status Indicators

| **Color** | **Status** | **Action**                 |
| --------- | ---------- | -------------------------- |
| 🟢 Green  | Healthy    | Normal operation           |
| 🟡 Yellow | Warning    | Monitor closely            |
| 🔴 Red    | Error      | Immediate attention needed |

## 🆘 Quick Troubleshooting

### No Bills Generated on 5th

1. Check if bills already exist for current month
2. Verify active students in system
3. Use manual trigger: "Trigger Monthly Billing"

### Reminders Not Sending

1. Verify family contact information
2. Check due dates are set correctly
3. Use manual trigger for specific reminder type

### Reports Missing

1. Check database connectivity
2. Verify payment data exists
3. Use manual trigger for specific report type

## 📞 Emergency Actions

### Critical Billing Issue

```
Action: Manual Monthly Billing
Location: Operations → Overview → "Trigger Monthly Billing"
Verify: Check completion message and student count
```

### Reminder System Down

```
Action: Manual Reminders
Location: Operations → Reminders → Choose type
Safe: Can send multiple times without issues
```

### Need Immediate Report

```
Action: Manual Report Generation
Location: Operations → Reports → Choose type
Output: Server logs will show generated data
```

## 📊 Key Metrics to Monitor

### Daily

- System status indicators (green/yellow/red)
- Reminder execution logs
- Failed job count

### Weekly

- Weekly report data
- Collection efficiency
- System performance

### Monthly

- Monthly billing completion
- Outstanding dues trends
- Overall automation health

## 🔗 Quick Links

- **Operations Dashboard**: `/admin/operations`
- **System Health**: `/api/health/automation`
- **Automation Status**: `/api/automation/status`

## 📋 Daily Admin Checklist

- [ ] Check Operations Dashboard status
- [ ] Review overnight automation logs
- [ ] Verify reminder notifications sent
- [ ] Address any red status indicators
- [ ] Monitor outstanding dues levels

---

_Keep this reference handy for quick automation management!_
