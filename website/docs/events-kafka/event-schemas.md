---
title: Event Schemas
sidebar_position: 3
---

# Event Schemas

All events share a common envelope. Each section below shows the full event payload for a specific topic.

## Common envelope

Every event is wrapped in this envelope:

```json
{
  "eventId": "evt-abc-123",
  "eventType": "comms.message.delivered",
  "version": "1.0",
  "occurredAt": "2024-01-15T10:30:12Z",
  "correlationId": "corr-xyz-789",
  "payload": { ... }
}
```

| Field | Type | Description |
|---|---|---|
| `eventId` | `string` | Unique event ID (UUID v4) |
| `eventType` | `string` | Identifies the topic / event type |
| `version` | `string` | Schema version — consumers should check this |
| `occurredAt` | `datetime` | ISO 8601 UTC timestamp of the event |
| `correlationId` | `string` | Echo of `metadata.correlationId` from the request |
| `payload` | `object` | Event-specific fields (see below) |

---

## comms.message.requested

Published when a message is accepted by the platform.

```json
{
  "eventId": "evt-001-abc",
  "eventType": "comms.message.requested",
  "version": "1.0",
  "occurredAt": "2024-01-15T10:30:00Z",
  "correlationId": "corr-xyz-789",
  "payload": {
    "messageId": "msg-9a3f2c1d",
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
      "idempotencyKey": "req-abc-12345",
      "tags": ["account-notifications"]
    }
  }
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `messageId` | `string` | Platform-assigned message ID |
| `channel` | `string` | Requested channel (may be `auto`) |
| `recipient` | `object` | Recipient as submitted (partyId or contactDetails) |
| `content` | `object` | Content as submitted (templateId + variables, or inline) |
| `metadata` | `object` | Priority, idempotency key, tags, correlationId |

---

## comms.message.routed

Published when the Channel Router has determined the delivery channel (always produced, including for explicit channel requests).

```json
{
  "eventId": "evt-002-def",
  "eventType": "comms.message.routed",
  "version": "1.0",
  "occurredAt": "2024-01-15T10:30:01Z",
  "correlationId": "corr-xyz-789",
  "payload": {
    "messageId": "msg-9a3f2c1d",
    "resolvedChannel": "email",
    "requestedChannel": "auto",
    "routingReason": "party_preference",
    "resolvedContactDetails": {
      "email": "jane.smith@example.com"
    }
  }
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `messageId` | `string` | Platform-assigned message ID |
| `resolvedChannel` | `string` | The channel that will be used for delivery |
| `requestedChannel` | `string` | The channel requested (`auto` or explicit) |
| `routingReason` | `string` | Why this channel was chosen: `party_preference`, `explicit`, `fallback` |
| `resolvedContactDetails` | `object` | Masked contact details used (e.g. `email` with domain visible only) |

---

## comms.message.sent

Published when the downstream provider has acknowledged the message.

```json
{
  "eventId": "evt-003-ghi",
  "eventType": "comms.message.sent",
  "version": "1.0",
  "occurredAt": "2024-01-15T10:30:05Z",
  "correlationId": "corr-xyz-789",
  "payload": {
    "messageId": "msg-9a3f2c1d",
    "channel": "email",
    "provider": "aws-ses",
    "providerMessageId": "01020195abc2def3-4567-89ab-cdef",
    "sentAt": "2024-01-15T10:30:05Z"
  }
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `messageId` | `string` | Platform-assigned message ID |
| `channel` | `string` | Delivery channel used |
| `provider` | `string` | Provider identifier (e.g. `aws-ses`, `twilio`, `apns`, `fcm`) |
| `providerMessageId` | `string` | Message reference from the provider |
| `sentAt` | `datetime` | Timestamp when provider acknowledged |

---

## comms.message.delivered

Published when confirmed delivery is received from the provider.

```json
{
  "eventId": "evt-004-jkl",
  "eventType": "comms.message.delivered",
  "version": "1.0",
  "occurredAt": "2024-01-15T10:30:12Z",
  "correlationId": "corr-xyz-789",
  "payload": {
    "messageId": "msg-9a3f2c1d",
    "channel": "email",
    "provider": "aws-ses",
    "providerMessageId": "01020195abc2def3-4567-89ab-cdef",
    "deliveredAt": "2024-01-15T10:30:12Z"
  }
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `messageId` | `string` | Platform-assigned message ID |
| `channel` | `string` | Delivery channel |
| `provider` | `string` | Provider that confirmed delivery |
| `providerMessageId` | `string` | Provider's message reference |
| `deliveredAt` | `datetime` | Confirmed delivery timestamp |

---

## comms.message.failed

Published when delivery fails permanently (no further retries will occur).

```json
{
  "eventId": "evt-005-mno",
  "eventType": "comms.message.failed",
  "version": "1.0",
  "occurredAt": "2024-01-15T10:31:00Z",
  "correlationId": "corr-xyz-789",
  "payload": {
    "messageId": "msg-9a3f2c1d",
    "channel": "sms",
    "failureCode": "INVALID_PHONE_NUMBER",
    "failureReason": "The phone number +447700900000 is not a valid mobile number",
    "provider": "twilio",
    "failedAt": "2024-01-15T10:31:00Z",
    "attemptCount": 3
  }
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `messageId` | `string` | Platform-assigned message ID |
| `channel` | `string` | Delivery channel attempted |
| `failureCode` | `string` | Machine-readable failure code |
| `failureReason` | `string` | Human-readable failure description |
| `provider` | `string` | Provider that reported the failure |
| `failedAt` | `datetime` | Timestamp of final failure |
| `attemptCount` | `integer` | Number of delivery attempts made |

**Common failure codes:**

| Code | Description |
|---|---|
| `INVALID_PHONE_NUMBER` | Phone number is not valid or not reachable |
| `INVALID_EMAIL_ADDRESS` | Email address is malformed or rejected |
| `PARTY_OPTED_OUT` | Recipient has opted out of all communications |
| `CHANNEL_OPTED_OUT` | Recipient has opted out of this specific channel |
| `NO_CONTACT_DETAILS` | Cannot resolve contact details for channel |
| `PROVIDER_ERROR` | Upstream provider returned an unrecoverable error |
| `RATE_LIMIT_EXCEEDED` | Provider rate limit hit and retries exhausted |

---

## comms.message.bounced

Email-only. Published when an email bounces.

```json
{
  "eventId": "evt-006-pqr",
  "eventType": "comms.message.bounced",
  "version": "1.0",
  "occurredAt": "2024-01-15T10:32:00Z",
  "correlationId": "corr-xyz-789",
  "payload": {
    "messageId": "msg-9a3f2c1d",
    "channel": "email",
    "bounceType": "hard",
    "bounceSubType": "general",
    "bouncedAddress": "jane.smith@example.com",
    "bounceReason": "550 5.1.1 The email account that you tried to reach does not exist",
    "bouncedAt": "2024-01-15T10:32:00Z",
    "suppressionApplied": true
  }
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `messageId` | `string` | Platform-assigned message ID |
| `channel` | `string` | Always `email` |
| `bounceType` | `string` | `hard` (permanent) or `soft` (temporary) |
| `bounceSubType` | `string` | Provider-specific sub-classification |
| `bouncedAddress` | `string` | Email address that bounced |
| `bounceReason` | `string` | SMTP error message from the receiving server |
| `bouncedAt` | `datetime` | Bounce timestamp |
| `suppressionApplied` | `boolean` | `true` if the address has been added to the suppression list |

:::warning Hard bounce suppression
On a hard bounce, the email address is automatically added to the platform suppression list. Future sends to that address will fail immediately with `BOUNCED_ADDRESS_SUPPRESSED`. To remove an address from the suppression list, contact the platform team.
:::

---

## comms.message.opened

Email-only, requires open tracking on the template. May fire multiple times per message.

```json
{
  "eventId": "evt-007-stu",
  "eventType": "comms.message.opened",
  "version": "1.0",
  "occurredAt": "2024-01-15T11:45:00Z",
  "correlationId": "corr-xyz-789",
  "payload": {
    "messageId": "msg-9a3f2c1d",
    "channel": "email",
    "openedAt": "2024-01-15T11:45:00Z",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    "ipAddress": "203.0.113.0",
    "openCount": 2
  }
}
```

**Payload fields:**

| Field | Type | Description |
|---|---|---|
| `messageId` | `string` | Platform-assigned message ID |
| `channel` | `string` | Always `email` |
| `openedAt` | `datetime` | Timestamp of this open event |
| `userAgent` | `string` | User agent string from the open tracking pixel request |
| `ipAddress` | `string` | IP address (anonymised — last octet zeroed) |
| `openCount` | `integer` | Total number of opens recorded for this message |
