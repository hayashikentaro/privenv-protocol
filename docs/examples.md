# Examples

All values in this document are deliberately fake.

## Safe Manifest

```json
{
  "version": "0.1",
  "capabilities": [
    {
      "id": "cmd.example.test",
      "kind": "command",
      "description": "Run the fake example test capability",
      "command": {
        "program": "npm",
        "args": ["test"]
      },
      "env": [
        {
          "name": "EXAMPLE_SERVICE_TOKEN",
          "source": "secret",
          "exposedToGuest": false
        }
      ]
    }
  ]
}
```

The manifest may name environment variables, but it must not include values.

## EffectRequest

```json
{
  "id": "req_fake_001",
  "type": "effect.request",
  "capabilityId": "cmd.example.test",
  "metadata": {
    "guestName": "fake-guest",
    "guestRunId": "run_fake_001",
    "reason": "local fixture validation"
  }
}
```

Requests reference `capabilityId`. They must not include command strings, env values, tokens, credentials, or timeout overrides.

## EffectResponse Success

```json
{
  "requestId": "req_fake_001",
  "type": "effect.response",
  "ok": true,
  "result": {
    "exitCode": 0,
    "stdout": "fixture command completed with redacted output",
    "stderr": "",
    "redactions": [
      {
        "stream": "stdout",
        "count": 1,
        "reason": "secret"
      }
    ]
  },
  "auditId": "audit_fake_001"
}
```

## EffectResponse Error

```json
{
  "requestId": "req_fake_002",
  "type": "effect.response",
  "ok": false,
  "error": {
    "code": "capability.not_found",
    "message": "Requested capability is not available"
  },
  "auditId": "audit_fake_002"
}
```
