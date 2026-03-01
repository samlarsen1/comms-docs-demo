---
title: Core Concepts
sidebar_position: 3
---

# Core Concepts

## Channels {#channels}

The platform supports five delivery channels plus smart auto-routing.

### Email {#email}

Full-featured email delivery via cloud email providers. Supports:
- Plain text and HTML bodies
- File attachments (PDF, images, etc.)
- Template-based or inline content
- Open and click tracking (optional)

**Required contact detail:** `email` address.

### SMS {#sms}

Short message delivery to mobile handsets globally. Supports:
- Plain text only (no HTML)
- Unicode characters (emoji, non-latin scripts)
- Messages up to 1600 characters (split into segments automatically)

**Required contact detail:** `phone` in E.164 format (e.g. `+447700900123`).

### Push {#push}

Mobile push notifications to iOS and Android devices via APNs/FCM. Supports:
- Title and body
- Silent/background pushes
- Rich notifications (requires native SDK integration)

**Required contact detail:** Device token registered against the `partyId`.

### Documents {#documents}

Two sub-channels for document delivery:

| Sub-channel | Key | Delivery method |
|---|---|---|
| Digital | `document_digital` | PDF made available via secure online portal |
| Postal | `document_postal` | Printed and mailed to a physical address |

**Required contact detail for postal:** Full `address` including `postcode`.

---

## Recipients

Every message has a recipient. The platform supports two identification modes:

### Known party (by partyId)

If the recipient is known to your system, identify them by their internal `partyId`. The platform looks up their contact details and channel preferences automatically.

```json
"recipient": {
  "partyId": "party-123"
}
```

**Benefits:**
- Contact details resolved from the party profile (no need to pass them each time)
- Channel preferences honoured automatically
- Opt-outs enforced automatically

### Unknown party (by contactDetails)

For recipients not in your party system, pass contact details directly. No party record is needed.

```json
"recipient": {
  "contactDetails": {
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "+447700900123",
    "address": {
      "line1": "10 Example Street",
      "city": "London",
      "postcode": "EC1A 1BB",
      "country": "GB"
    }
  }
}
```

:::note Opt-outs for unknown parties
Opt-out enforcement is not applied to unknown parties — you are responsible for managing consent for contacts not in the party system.
:::

---

## Smart Routing (Auto Channel) {#smart-routing}

Setting `channel: auto` delegates channel selection to the platform. The routing algorithm evaluates:

1. **Party preferences** — the recipient's `preferredChannel` setting
2. **Opt-outs** — channels the recipient has opted out of are excluded
3. **Contact detail availability** — if the preferred channel requires an email address but none is stored, the platform falls back to the next best option
4. **Message content** — some content types (e.g. HTML) may only be suitable for certain channels

If no suitable channel can be found, the message fails with `NO_CONTACT_DETAILS`.

```json
{
  "channel": "auto",
  "recipient": { "partyId": "party-789" },
  "content": { "templateId": "tmpl-account-update" }
}
```

---

## Templates

Templates are reusable message definitions managed as **configuration** — they are defined in source control and deployed through your environment pipeline, not created or modified via the API.

- **Handlebars variable substitution**: `{{firstName}}`, `{{accountNumber}}`
- **Per-channel content**: subject line (email), plain text, HTML body
- **Variable declarations**: each template declares expected variables with types and required flags
- **Versioning**: templates are versioned; deploying a new version does not affect in-flight messages

Use `GET /v1/templates` and `GET /v1/templates/{templateId}` to inspect templates available in a given environment.

### Using a template

```json
"content": {
  "templateId": "tmpl-welcome-email",
  "variables": {
    "firstName": "Jane",
    "accountNumber": "ACC-456"
  }
}
```

### Inline content (no template)

For one-off messages, you can pass content inline without a template:

```json
"content": {
  "subject": "Your appointment tomorrow",
  "body": "This is a reminder that your appointment is at 3pm tomorrow."
}
```

---

## Message Lifecycle

Every message passes through the following states:

```
accepted → queued → sending → sent → delivered
                                   ↘ failed
                                   ↘ bounced  (email only)
```

| Status | Description |
|---|---|
| `accepted` | Request received and validated |
| `queued` | Queued to the downstream provider |
| `sending` | Submitted to provider, awaiting acknowledgement |
| `sent` | Provider confirmed receipt |
| `delivered` | Confirmed delivery to recipient |
| `failed` | Delivery failed — check `failureReason` |
| `bounced` | Email bounced (hard bounce = invalid address; soft bounce = temporary) |

Track status via the [REST API](../rest-apis) or subscribe to [Kafka lifecycle events](../events-kafka/event-schemas).

---

## Idempotency

To safely retry a send request without risk of duplicate delivery, include an `idempotencyKey` in `metadata`:

```json
"metadata": {
  "idempotencyKey": "your-unique-key-per-send-attempt"
}
```

If a message with the same `idempotencyKey` was accepted within the last **24 hours**, the platform returns the original response without re-sending.

Use a stable, unique key — for example, a UUID derived from your internal event or transaction ID.

---

## Priority

Messages can be marked with a `priority`:

| Priority | Behaviour |
|---|---|
| `high` | Bypasses standard queue; dispatched immediately (subject to rate limits) |
| `normal` | Standard queuing (default) |
| `low` | Batched for off-peak delivery |

---

## Opt-outs

The platform enforces opt-outs automatically for known parties:

- **Global opt-out** (`optedOut: true`): All channels blocked. Message fails with `PARTY_OPTED_OUT`.
- **Channel opt-out** (`channelOptOuts: ["email"]`): That channel is blocked. With `channel: auto`, the platform routes to another channel instead.

Update opt-outs via the [Preferences API](../rest-apis/preferences).
