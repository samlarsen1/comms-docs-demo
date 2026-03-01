---
title: Overview
sidebar_position: 1
---

# File-Based Integrations

The Comms Platform supports file-based integrations for teams who prefer batch workflows over real-time API calls, or who need to send large volumes of messages from legacy systems.

## How it works

File integrations use **SFTP** as the transport layer. You drop files into designated inbound directories; the platform picks them up, processes them, and writes results to outbound directories.

```
Your System ──SFTP──▶ /inbound/pending/    ──▶ Platform processes
                       /inbound/processing/      messages
                       /inbound/processed/

Platform     ──SFTP──▶ /outbound/delivery-reports/
                       /outbound/error-reports/
```

## SFTP connection details

| Property | Value |
|---|---|
| Host | `sftp.comms.example.com` |
| Port | `22` |
| Authentication | SSH key pair (RSA 4096-bit minimum) |
| Ciphers | `aes256-gcm@openssh.com`, `aes128-gcm@openssh.com` |
| Transfer mode | Binary |

Contact the platform team to:
1. Provision your SFTP account
2. Register your public key
3. Confirm directory paths for your environment

## Directory structure

```
/comms-platform/
├── inbound/
│   ├── pending/          ← Drop files here to trigger processing
│   ├── processing/       ← System moves files here while processing
│   └── processed/        ← Successfully processed files archived here (30-day retention)
├── outbound/
│   ├── delivery-reports/ ← Daily delivery summary reports
│   └── error-reports/    ← Files that failed processing
└── templates/
    ├── pending/          ← Drop HTML/TXT template files here
    └── processed/        ← Imported templates archived here
```

## Processing schedule

| File type | Processing frequency | Processing window |
|---|---|---|
| Batch messages | Every 15 minutes | 24/7 |
| Templates | Every 60 minutes | 24/7 |
| Delivery reports | Daily | Produced by 06:00 UTC |

## File types

| Use case | File | Direction | Docs |
|---|---|---|---|
| Bulk message sends | `batch-messages-*.csv` / `batch-messages-*.json` | Inbound | [Batch Messages](./batch-messages) |
| Delivery status reconciliation | `delivery-report-YYYYMMDD.csv` | Outbound | [Delivery Reports](./delivery-reports) |

## Error handling

If a file fails processing, it is moved to `/inbound/error-reports/` with an accompanying `*-errors.json` file describing the rows that failed. Successfully processed rows are still sent; only invalid rows are skipped.

Example error report:

```json
{
  "sourceFile": "batch-messages-20240115.csv",
  "processedAt": "2024-01-15T09:15:00Z",
  "totalRows": 1000,
  "successRows": 995,
  "errorRows": 5,
  "errors": [
    {
      "row": 42,
      "field": "channel",
      "value": "whatsapp",
      "message": "Unknown channel. Must be one of: email, sms, push, document_digital, document_postal, auto"
    },
    {
      "row": 87,
      "field": "phone",
      "value": "07700900123",
      "message": "Phone number must be in E.164 format (e.g. +447700900123)"
    }
  ]
}
```
