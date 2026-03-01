---
title: Overview
sidebar_position: 1
---

# Event-Driven Architecture

The Comms Platform publishes Kafka events for every significant state change in the message lifecycle. Consuming these events lets you build real-time, decoupled integrations without polling the REST API.

## When to use Kafka vs REST

| Use case | Recommended approach |
|---|---|
| Send a message and get an immediate reference ID | REST API (`POST /v1/messages`) |
| Track delivery status in real time | Kafka (`comms.message.delivered`) |
| React to failures automatically | Kafka (`comms.message.failed`) |
| Audit trail / event sourcing | Kafka (consume all topics) |
| Bulk send from a backend service | Kafka (`comms.message.requested`) or File/SFTP |

## Kafka cluster

| Property | Value |
|---|---|
| Bootstrap servers | `kafka.comms.example.com:9092` |
| Security protocol | `SASL_SSL` |
| SASL mechanism | `OAUTHBEARER` |
| Schema registry | `https://schema-registry.comms.example.com` |

Credentials are provisioned per consuming application. Contact the platform team to request access.

## Topics at a glance

| Topic | Direction | Description |
|---|---|---|
| `comms.message.requested` | Inbound / Outbound | Produced when a message is accepted. Also accepts inbound produces to trigger sends. |
| `comms.message.routed` | Outbound | Produced when auto-routing has determined the channel |
| `comms.message.queued` | Outbound | Produced when the message is queued to a provider |
| `comms.message.sent` | Outbound | Produced when the provider confirms acceptance |
| `comms.message.delivered` | Outbound | Produced on confirmed delivery |
| `comms.message.failed` | Outbound | Produced when delivery fails |
| `comms.message.bounced` | Outbound | Produced when an email bounces |
| `comms.message.opened` | Outbound | Produced when an email is opened (if tracking enabled) |

## Common event envelope

All events share the same top-level envelope:

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
| `eventId` | `string` | Unique event identifier (UUID) |
| `eventType` | `string` | Topic name (e.g. `comms.message.delivered`) |
| `version` | `string` | Schema version (currently `1.0`) |
| `occurredAt` | `datetime` | ISO 8601 timestamp when the event occurred |
| `correlationId` | `string` | Echoes the `correlationId` from the message request, if supplied |
| `payload` | `object` | Event-specific data (see [Event Schemas](./event-schemas)) |

## Consumer groups

Use a dedicated consumer group per application. The platform guarantees **at-least-once delivery** — design consumers to be idempotent.

```properties
# Example consumer.properties
group.id=your-app-name
auto.offset.reset=earliest
enable.auto.commit=false
```

## Message key

All events are keyed by `messageId`. This ensures that all events for a given message land on the same partition, preserving ordering guarantees per message.

## Retention

| Topic type | Retention |
|---|---|
| Lifecycle events | 7 days |
| `comms.message.requested` | 3 days |

## Next steps

- [Topology](./topology) — end-to-end data flow diagram
- [Event Schemas](./event-schemas) — full payload definitions for each topic
