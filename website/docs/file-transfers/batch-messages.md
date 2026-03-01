---
title: Batch Messages
sidebar_position: 2
---

# Batch Message Files

Send large volumes of messages by dropping a batch file on the SFTP server. The platform processes each row as an individual message request.

## Supported formats

- **CSV** — easiest for bulk exports from spreadsheets or data warehouses
- **JSON** — structured format suited for programmatic generation

## File naming

Files must match the pattern `batch-messages-*.{csv,json}` to be picked up for processing. Use a timestamp or unique identifier to avoid name collisions:

```
batch-messages-20240115-001.csv
batch-messages-20240115T0900-campaign-spring.json
```

---

## CSV format

### Column definitions

| Column | Required | Description | Example |
|---|---|---|---|
| `channel` | Yes | Delivery channel | `email`, `sms`, `auto` |
| `partyId` | One of | Known party reference (mutually exclusive with contact columns) | `party-123` |
| `name` | No | Recipient name (for unknown parties) | `Jane Smith` |
| `email` | Conditional | Email address (required if channel is `email`) | `jane@example.com` |
| `phone` | Conditional | E.164 phone (required if channel is `sms` or `push`) | `+447700900123` |
| `address_line1` | Conditional | (required if channel is `document_postal`) | `10 Example St` |
| `address_line2` | No | Address line 2 | `Flat 4` |
| `address_city` | Conditional | City (required with `document_postal`) | `London` |
| `address_postcode` | Conditional | Postcode (required with `document_postal`) | `EC1A 1BB` |
| `address_country` | No | ISO country code (default: `GB`) | `GB` |
| `templateId` | One of | Template reference (mutually exclusive with `body`) | `tmpl-abc-123` |
| `body` | One of | Inline message body (when no template) | `Your code is 123456` |
| `subject` | No | Email subject override | `Your April statement` |
| `var_*` | Conditional | Template variable (prefix with `var_`) | `var_firstName=Jane` |
| `metadata_priority` | No | `high`, `normal`, or `low` (default: `normal`) | `high` |
| `metadata_idempotencyKey` | No | Deduplication key | `batch-2024-row-42` |
| `metadata_tags` | No | Semicolon-separated tags | `campaign-spring;q1` |

### Example CSV

```csv
channel,partyId,email,phone,templateId,var_firstName,var_accountNumber,metadata_priority
email,party-123,,,tmpl-welcome-email,Jane,ACC-456,normal
sms,,+447700900123,,tmpl-otp-sms,,,high
auto,party-789,,,tmpl-statement,John,ACC-789,normal
email,,jane@example.com,,tmpl-newsletter,Jane,,low
document_postal,party-456,,,tmpl-annual-statement,,,normal
```

:::tip Empty columns
Leave columns blank rather than omitting them — all column headers must be present on row 1.
:::

---

## JSON format

### Schema

```json
{
  "version": "1.0",
  "messages": [
    {
      "channel": "string",
      "recipient": {
        "partyId": "string",
        "contactDetails": {
          "name": "string",
          "email": "string",
          "phone": "string",
          "address": {
            "line1": "string",
            "line2": "string",
            "city": "string",
            "postcode": "string",
            "country": "string"
          }
        }
      },
      "content": {
        "templateId": "string",
        "variables": {
          "key": "value"
        },
        "subject": "string",
        "body": "string"
      },
      "metadata": {
        "priority": "normal",
        "idempotencyKey": "string",
        "tags": ["string"]
      }
    }
  ]
}
```

### Example JSON batch file

```json
{
  "version": "1.0",
  "messages": [
    {
      "channel": "email",
      "recipient": {
        "partyId": "party-123"
      },
      "content": {
        "templateId": "tmpl-welcome-email",
        "variables": {
          "firstName": "Jane",
          "accountNumber": "ACC-456"
        }
      },
      "metadata": {
        "priority": "normal",
        "tags": ["onboarding"]
      }
    },
    {
      "channel": "sms",
      "recipient": {
        "contactDetails": {
          "name": "John Smith",
          "phone": "+447700900123"
        }
      },
      "content": {
        "body": "Your appointment is confirmed for 3pm tomorrow."
      },
      "metadata": {
        "priority": "high",
        "idempotencyKey": "appt-confirm-john-20240115"
      }
    },
    {
      "channel": "document_postal",
      "recipient": {
        "partyId": "party-456"
      },
      "content": {
        "templateId": "tmpl-annual-statement",
        "variables": {
          "year": "2023",
          "totalValue": "£12,450.00"
        }
      }
    }
  ]
}
```

---

## File size limits

| Property | Limit |
|---|---|
| Max rows per CSV | 50,000 |
| Max messages per JSON | 50,000 |
| Max file size | 100 MB |

For larger volumes, split into multiple files with a consistent naming prefix.

---

## Tracking results

Each row in the batch becomes a standard message on the platform. Track outcomes via:

- **Delivery reports**: Daily CSV files in `/outbound/delivery-reports/` (see [Delivery Reports](./delivery-reports))
- **Kafka events**: Subscribe to lifecycle topics with your batch's `idempotencyKey` or `tags` to filter events
- **REST API**: Query `GET /v1/messages?tags=my-batch-tag` to list messages for a batch

:::tip Idempotency keys for batch rows
Set a unique `metadata_idempotencyKey` (JSON: `metadata.idempotencyKey`) per row to safely re-submit a batch after a partial failure — already-sent rows will not be re-delivered.
:::
