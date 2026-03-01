---
title: Topics & Topology
sidebar_position: 2
---

# Topics & Topology

## End-to-end data flow

The diagram below shows how a message flows through the platform — from an API call or batch file, through internal routing and provider dispatch, to final delivery confirmation.

```mermaid
flowchart TD
    subgraph Producers["Message Producers"]
        API["REST API\n(POST /v1/messages)"]
        FILE["File Processor\n(SFTP batch)"]
        KAFKA_IN["Kafka Producer\n(direct publish)"]
    end

    subgraph T1["comms.message.requested"]
        direction LR
        REQ["Message Request\nEvent"]
    end

    subgraph Router["Channel Router Service"]
        ROUTE["Resolve channel &\ncontact details"]
    end

    subgraph T2["comms.message.routed"]
        direction LR
        ROUTED["Routed Event\n(channel determined)"]
    end

    subgraph Senders["Channel Senders"]
        EMAIL["Email Sender\n(AWS SES)"]
        SMS["SMS Sender\n(Twilio)"]
        PUSH["Push Sender\n(APNs / FCM)"]
        DOC_D["Digital Doc Sender\n(Portal)"]
        DOC_P["Postal Doc Sender\n(Print Fulfiller)"]
    end

    subgraph T3["comms.message.sent"]
        SENT["Provider\nAcknowledged"]
    end

    subgraph Webhooks["Provider Webhooks"]
        WH["Delivery Webhook\nProcessor"]
    end

    subgraph T4["Delivery Outcome Topics"]
        DELIVERED["comms.message.delivered"]
        FAILED["comms.message.failed"]
        BOUNCED["comms.message.bounced"]
        OPENED["comms.message.opened"]
    end

    API --> T1
    FILE --> T1
    KAFKA_IN --> T1

    T1 --> Router
    Router --> T2

    T2 --> EMAIL
    T2 --> SMS
    T2 --> PUSH
    T2 --> DOC_D
    T2 --> DOC_P

    EMAIL --> T3
    SMS --> T3
    PUSH --> T3
    DOC_D --> T3
    DOC_P --> T3

    T3 --> Webhooks

    Webhooks --> DELIVERED
    Webhooks --> FAILED
    Webhooks --> BOUNCED
    Webhooks --> OPENED
```

## Topic details

### `comms.message.requested`

**Type:** Inbound / Outbound
**Partitions:** 12
**Retention:** 3 days

Produced when a message request is accepted, regardless of entry point (REST API, file, or direct Kafka produce). This is the canonical "message created" event.

Consumers of this topic can:
- Build audit trails
- Trigger internal workflows (e.g. CRM updates)
- Produce to this topic directly to send messages without using the REST API

**Key:** `messageId`

---

### `comms.message.routed`

**Type:** Outbound
**Partitions:** 12
**Retention:** 7 days

Produced by the Channel Router after resolving the delivery channel for `auto`-routed messages. For messages with an explicit channel, this event is still produced (with `routingReason: "explicit"`).

**Key:** `messageId`

---

### `comms.message.queued`

**Type:** Outbound
**Partitions:** 12
**Retention:** 7 days

Produced when the message has been queued to the downstream provider. This confirms the message left the platform's internal queue.

**Key:** `messageId`

---

### `comms.message.sent`

**Type:** Outbound
**Partitions:** 12
**Retention:** 7 days

Produced when the provider has acknowledged receipt of the message. "Sent" means the provider accepted it — not necessarily that it reached the recipient's inbox/device.

**Key:** `messageId`

---

### `comms.message.delivered`

**Type:** Outbound
**Partitions:** 12
**Retention:** 7 days

Produced when the platform receives a confirmed delivery notification from the provider. Not all channels support delivery confirmation:

| Channel | Delivery confirmation |
|---|---|
| Email | Via provider webhook (not guaranteed — many clients don't send read receipts) |
| SMS | Delivery receipt from carrier |
| Push | APNs/FCM delivery receipt |
| Digital Document | Confirmed when recipient views the document |
| Postal | Estimated — based on expected postal transit time |

**Key:** `messageId`

---

### `comms.message.failed`

**Type:** Outbound
**Partitions:** 12
**Retention:** 7 days

Produced when delivery fails permanently. Includes a `failureCode` and `failureReason` for diagnosis.

**Key:** `messageId`

---

### `comms.message.bounced`

**Type:** Outbound
**Partitions:** 4
**Retention:** 7 days

Email-only. Produced when an email bounces. Distinguishes between:
- **Hard bounce**: Invalid address — the party's email will be automatically suppressed
- **Soft bounce**: Temporary failure (mailbox full, server down) — the platform may retry

**Key:** `messageId`

---

### `comms.message.opened`

**Type:** Outbound
**Partitions:** 4
**Retention:** 7 days

Email-only, requires open tracking to be enabled on the template. Produced when the recipient opens the email. May fire multiple times if the email is opened more than once.

**Key:** `messageId`
