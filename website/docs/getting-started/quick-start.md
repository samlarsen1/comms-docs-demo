---
title: Quick Start
sidebar_position: 1
---

# Quick Start

Send your first message in under 5 minutes.

## Prerequisites

- An API token (see [Authentication](./authentication))
- A template ID, or use the inline `body` field

## 1. Send a message to a known customer

If you know the recipient's internal `partyId`, the platform resolves their contact details and preferences automatically:

```bash
curl -X POST https://api.comms.example.com/v1/messages \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
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
    }
  }'
```

**Response** (`202 Accepted`):

```json
{
  "messageId": "msg-9a3f2c1d",
  "channel": "email",
  "status": "accepted",
  "recipient": {
    "partyId": "party-123"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

A `202` means the message has been **accepted and queued** — not yet delivered. Use the `messageId` to track status.

## 2. Send to an unknown party

For recipients not in your party system, provide contact details directly:

```bash
curl -X POST https://api.comms.example.com/v1/messages \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "sms",
    "recipient": {
      "contactDetails": {
        "name": "John Smith",
        "phone": "+447700900123"
      }
    },
    "content": {
      "body": "Your appointment is confirmed for 3pm tomorrow."
    }
  }'
```

## 3. Use smart routing (auto channel)

Let the platform pick the best channel based on recipient preferences:

```bash
curl -X POST https://api.comms.example.com/v1/messages \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "auto",
    "recipient": {
      "partyId": "party-789"
    },
    "content": {
      "templateId": "tmpl-account-update",
      "variables": {
        "balanceDue": "£150.00",
        "dueDate": "2024-02-15"
      }
    },
    "metadata": {
      "priority": "high",
      "idempotencyKey": "req-abc-12345"
    }
  }'
```

## 4. Check delivery status

Poll the message status endpoint using the `messageId` from the send response:

```bash
curl https://api.comms.example.com/v1/messages/msg-9a3f2c1d \
  -H "Authorization: Bearer <your-token>"
```

```json
{
  "messageId": "msg-9a3f2c1d",
  "channel": "email",
  "status": "delivered",
  "deliveredAt": "2024-01-15T10:30:12Z",
  "providerMessageId": "01020195abc2def3-4567-89ab-cdef"
}
```

:::tip Real-time delivery events
For production integrations, subscribe to [Kafka events](../events-kafka/overview) instead of polling. The `comms.message.delivered` topic fires the moment delivery is confirmed.
:::

## Message status lifecycle

```
accepted → queued → sending → sent → delivered
                                   ↘ failed
                                   ↘ bounced  (email only)
```

## SDK examples

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
<TabItem value="js" label="Node.js">

```javascript
const response = await fetch('https://api.comms.example.com/v1/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.COMMS_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    channel: 'email',
    recipient: { partyId: 'party-123' },
    content: {
      templateId: 'tmpl-welcome-email',
      variables: { firstName: 'Jane' },
    },
  }),
});

const message = await response.json();
console.log(`Message accepted: ${message.messageId}`);
```

</TabItem>
<TabItem value="python" label="Python">

```python
import os
import requests

response = requests.post(
    'https://api.comms.example.com/v1/messages',
    headers={
        'Authorization': f'Bearer {os.environ["COMMS_API_TOKEN"]}',
        'Content-Type': 'application/json',
    },
    json={
        'channel': 'email',
        'recipient': {'partyId': 'party-123'},
        'content': {
            'templateId': 'tmpl-welcome-email',
            'variables': {'firstName': 'Jane'},
        },
    },
)

message = response.json()
print(f"Message accepted: {message['messageId']}")
```

</TabItem>
<TabItem value="java" label="Java">

```java
HttpClient client = HttpClient.newHttpClient();

String body = """
    {
      "channel": "email",
      "recipient": { "partyId": "party-123" },
      "content": {
        "templateId": "tmpl-welcome-email",
        "variables": { "firstName": "Jane" }
      }
    }
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.comms.example.com/v1/messages"))
    .header("Authorization", "Bearer " + System.getenv("COMMS_API_TOKEN"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println("Response: " + response.body());
```

</TabItem>
</Tabs>

## Next steps

- [Authentication](./authentication) — token scopes and security
- [Core Concepts](./concepts) — channels, recipients, templates in depth
- [REST API Reference](../rest-apis) — full endpoint documentation with Try It
