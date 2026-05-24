# Protocol

The protocol is JSON-compatible and intentionally small.

## EffectRequest

```ts
export interface EffectRequest {
  id: string;
  type: "effect.request";
  capabilityId: string;
  params?: Record<string, unknown>;
  metadata?: {
    guestName?: string;
    guestRunId?: string;
    reason?: string;
  };
}
```

`EffectRequest` references a capability by ID. It must not include raw execution fields such as `command`, `program`, `args`, `argv`, `shell`, `env`, `timeout`, `timeoutMs`, `secret`, `token`, or `credential`.

## EffectResponse

```ts
export interface EffectResponse {
  requestId: string;
  type: "effect.response";
  ok: boolean;
  result?: {
    exitCode?: number;
    stdout?: string;
    stderr?: string;
    redactions?: RedactionSummary[];
  };
  error?: {
    code: string;
    message: string;
  };
  auditId: string;
}
```

## RedactionSummary

```ts
export interface RedactionSummary {
  stream: "stdout" | "stderr" | "error";
  count: number;
  reason: "secret" | "sensitive-pattern" | "policy";
}
```

Responses are expected to be redacted before they reach a Guest. This package validates the response shape only; it does not perform Host redaction.
