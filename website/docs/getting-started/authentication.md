---
title: Authentication
sidebar_position: 2
---

# Authentication

All Comms Platform API requests are authenticated using **Bearer tokens** (JWT).

## Obtaining a token

Tokens are issued by your identity provider. Contact your platform administrator to obtain credentials for your environment.

```bash
# Exchange client credentials for a token
curl -X POST https://auth.comms.example.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=<your-client-id>" \
  -d "client_secret=<your-client-secret>" \
  -d "scope=comms:messages:write comms:templates:read"
```

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "scope": "comms:messages:write comms:templates:read"
}
```

## Using your token

Include the token in the `Authorization` header of every request:

```bash
curl https://api.comms.example.com/v1/messages \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Tokens expire after **24 hours**. Your application should handle `401` responses and re-authenticate automatically.

## Token scopes

Tokens are issued with scopes that control which operations are permitted:

| Scope | Permission |
|---|---|
| `comms:messages:write` | Send messages (`POST /v1/messages`) |
| `comms:messages:read` | Read message status (`GET /v1/messages/*`) |
| `comms:templates:read` | List and retrieve templates |
| `comms:templates:write` | Create, update, and delete templates |
| `comms:preferences:read` | Read party preferences |
| `comms:preferences:write` | Update party preferences |

Request the minimum set of scopes your application needs.

## Environments

| Environment | API Base URL | Auth URL |
|---|---|---|
| Production | `https://api.comms.example.com` | `https://auth.comms.example.com` |
| Sandbox | `https://api.sandbox.comms.example.com` | `https://auth.sandbox.comms.example.com` |

:::caution Sandbox vs Production
The sandbox environment is isolated from production. Messages sent in the sandbox are not delivered — they are simulated. Use the sandbox for development and testing.
:::

## Error responses

| HTTP Status | Code | Meaning |
|---|---|---|
| `401` | `UNAUTHORIZED` | Token is missing, expired, or malformed |
| `403` | `FORBIDDEN` | Token is valid but lacks the required scope |

```json
{
  "code": "UNAUTHORIZED",
  "message": "Invalid or missing Bearer token"
}
```

## Security best practices

- **Never commit tokens** to source control. Use environment variables or a secrets manager.
- **Rotate credentials** regularly and immediately if compromised.
- **Use the sandbox** for development — production tokens should not be used in dev/test pipelines.
- **Request minimal scopes** — principle of least privilege.
