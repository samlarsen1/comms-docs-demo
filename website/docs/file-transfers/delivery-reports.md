---
title: Delivery Reports
sidebar_position: 3
---

# Delivery Reports

The platform generates daily delivery report files and deposits them on the SFTP server. Use these for reconciliation, compliance reporting, and campaign analytics.

## Report types

| Report | Filename pattern | Frequency | Directory |
|---|---|---|---|
| Daily delivery summary | `delivery-report-YYYYMMDD.csv` | Daily | `/outbound/delivery-reports/` |
| Bounce report | `bounce-report-YYYYMMDD.csv` | Daily (if bounces occurred) | `/outbound/delivery-reports/` |
| Error report | `batch-errors-<source-filename>.json` | On batch processing failure | `/outbound/error-reports/` |

Reports are available by **06:00 UTC** for the previous calendar day.

---

## Daily delivery summary

`delivery-report-YYYYMMDD.csv`

A row per message sent during the report period.

### Column definitions

| Column | Type | Description | Example |
|---|---|---|---|
| `messageId` | string | Platform message identifier | `msg-9a3f2c1d` |
| `channel` | string | Delivery channel used | `email` |
| `status` | string | Final status at report time | `delivered` |
| `partyId` | string | Party identifier (if known) | `party-123` |
| `templateId` | string | Template used (if any) | `tmpl-welcome-email` |
| `requestedAt` | datetime | When the message was accepted | `2024-01-15T10:30:00Z` |
| `sentAt` | datetime | When the provider acknowledged | `2024-01-15T10:30:05Z` |
| `deliveredAt` | datetime | When delivery was confirmed (blank if not yet delivered) | `2024-01-15T10:30:12Z` |
| `failedAt` | datetime | When failure was recorded (blank if not failed) | |
| `failureCode` | string | Machine-readable failure code (blank if not failed) | |
| `failureReason` | string | Human-readable failure reason (blank if not failed) | |
| `provider` | string | Downstream provider used | `aws-ses` |
| `providerMessageId` | string | Provider's message reference | `01020195abc2def3` |
| `idempotencyKey` | string | Client-supplied idempotency key (if provided) | `req-abc-12345` |
| `tags` | string | Semicolon-separated tags | `onboarding;q1-2024` |
| `priority` | string | Message priority | `normal` |

### Example

```csv
messageId,channel,status,partyId,templateId,requestedAt,sentAt,deliveredAt,failedAt,failureCode,failureReason,provider,providerMessageId,idempotencyKey,tags,priority
msg-9a3f2c1d,email,delivered,party-123,tmpl-welcome-email,2024-01-15T10:30:00Z,2024-01-15T10:30:05Z,2024-01-15T10:30:12Z,,,,aws-ses,01020195abc2def3,req-abc-12345,onboarding,normal
msg-8b2e1d3c,sms,delivered,party-456,tmpl-otp-sms,2024-01-15T10:31:00Z,2024-01-15T10:31:02Z,2024-01-15T10:31:10Z,,,,twilio,SM1234567890,req-def-67890,,high
msg-7c1f0e2b,email,failed,,tmpl-newsletter,2024-01-15T10:32:00Z,,,2024-01-15T10:33:00Z,INVALID_EMAIL_ADDRESS,Email address rejected by receiving server,aws-ses,,req-ghi-11111,newsletter;q1-2024,low
msg-6d0e9f1a,push,delivered,party-789,,2024-01-15T10:33:00Z,2024-01-15T10:33:01Z,2024-01-15T10:33:05Z,,,,fcm,fcm-abc-123,,account-alerts,high
```

---

## Bounce report

`bounce-report-YYYYMMDD.csv`

A row per email bounce recorded during the report period. Only generated on days where bounces occurred.

### Column definitions

| Column | Type | Description | Example |
|---|---|---|---|
| `messageId` | string | Platform message identifier | `msg-9a3f2c1d` |
| `partyId` | string | Party identifier (if known) | `party-123` |
| `bouncedAddress` | string | Email address that bounced | `jane@example.com` |
| `bounceType` | string | `hard` or `soft` | `hard` |
| `bounceSubType` | string | Provider sub-classification | `general` |
| `bounceReason` | string | SMTP error from receiving server | `550 5.1.1 User unknown` |
| `bouncedAt` | datetime | Bounce timestamp | `2024-01-15T10:32:00Z` |
| `suppressionApplied` | boolean | Whether address was suppressed | `true` |
| `templateId` | string | Template used | `tmpl-welcome-email` |
| `idempotencyKey` | string | Client-supplied key (if provided) | |

### Example

```csv
messageId,partyId,bouncedAddress,bounceType,bounceSubType,bounceReason,bouncedAt,suppressionApplied,templateId,idempotencyKey
msg-abc-001,party-123,invalid@example.com,hard,general,"550 5.1.1 The email account does not exist",2024-01-15T10:32:00Z,true,tmpl-welcome-email,req-abc-001
msg-abc-002,party-456,full.mailbox@example.com,soft,mailboxfull,"452 4.2.2 Mailbox full",2024-01-15T10:45:00Z,false,tmpl-statement,
```

---

## Consuming reports

### Download via SFTP

```bash
# Download today's delivery report
sftp sftp.comms.example.com <<EOF
get /comms-platform/outbound/delivery-reports/delivery-report-20240115.csv ./
bye
EOF
```

### Automate with a cron job

```bash
#!/bin/bash
# Run daily at 07:00 UTC (after reports are ready at 06:00)
DATE=$(date -u +%Y%m%d --date="yesterday")
REPORT="delivery-report-${DATE}.csv"

sftp -i ~/.ssh/comms_platform_key sftp.comms.example.com:/comms-platform/outbound/delivery-reports/${REPORT} ./reports/

# Process the report
python3 process_delivery_report.py ./reports/${REPORT}
```

### Report retention

Files in `/outbound/delivery-reports/` are retained for **90 days** before automatic deletion. Archive reports locally if you need longer retention.

---

## Status values in reports

| Status | Description |
|---|---|
| `accepted` | Accepted but not yet queued (rare — usually transient) |
| `queued` | Queued to provider |
| `sending` | Submitted to provider |
| `sent` | Provider acknowledged |
| `delivered` | Confirmed delivery |
| `failed` | Permanent failure |
| `bounced` | Email bounced |

:::note Report timing
The daily report reflects message status **at midnight UTC**. A message that was `sent` at 23:55 and `delivered` at 00:05 will appear as `sent` in that day's report, and `delivered` in the following day's report. For real-time status, use the REST API or Kafka events.
:::
