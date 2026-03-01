---
id: intro
title: Introduction
sidebar_position: 1
slug: /
---

# Comms Platform

The **Comms Platform** is a unified communications delivery system that lets you send messages across any channel — email, SMS, push notifications, and documents — through a single API, Kafka integration, or file-based workflow.

Think of it as the communications layer for your organisation: instead of integrating directly with email providers, SMS gateways, and print fulfilment services, you talk to one API and the platform handles routing, templating, provider selection, and delivery tracking.

## What you can do

- **Send a message** to a recipient on a specific channel, or use `channel: auto` to let the platform route to the best channel based on their preferences.
- **Identify recipients** by a known `partyId` (the platform resolves their contact details) or by passing contact details directly for unknown parties.
- **Manage templates** with Handlebars variable substitution, versioning, and per-channel content.
- **Track delivery** in real time via Kafka events or by polling the REST API.
- **Bulk send** via file-based SFTP integrations for high-volume batch communications.

## Channels

| Channel | Key | Description |
|---|---|---|
| Email | `email` | Transactional and marketing emails |
| SMS | `sms` | Short messages to mobile devices |
| Push | `push` | Mobile push notifications |
| Digital Document | `document_digital` | PDFs delivered via a secure online portal |
| Postal Document | `document_postal` | Physical mail to a postal address |
| Auto (Smart Routing) | `auto` | Platform selects optimal channel from preferences |

## Integration options

Choose the integration pattern that fits your use case:

### REST API
The primary integration point. Synchronous request/response for sending messages, managing templates, and reading status. Includes a **Try It** console in these docs.

→ [REST API Reference](/docs/rest-apis)

### Kafka (Event-Driven)
Subscribe to delivery lifecycle events (`comms.message.delivered`, `comms.message.failed`, etc.) for real-time, decoupled integration. Also supports publishing message requests as events.

→ [Event-Driven Architecture](/docs/events-kafka)

### File / SFTP
Drop a batch message file on the SFTP server for high-volume sends. Retrieve daily delivery reports for reconciliation.

→ [File Integrations](/docs/file-transfers)

## Getting started

The fastest way to send your first message:

```bash
curl -X POST https://api.comms.example.com/v1/messages \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "email",
    "recipient": { "partyId": "party-123" },
    "content": {
      "templateId": "tmpl-welcome-email",
      "variables": { "firstName": "Jane" }
    }
  }'
```

→ [Quick Start Guide](/docs/getting-started/quick-start)
