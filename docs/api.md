# Public API

Current protocol version: `0.1`.

`@privenv/protocol` exports protocol-only types, validators, and errors. It does not implement Host runtime behavior, Guest runtime behavior, transport, secret handling, file loading, command execution, or passthrough behavior.

## Constants

### `PROTOCOL_VERSION`

```ts
export const PROTOCOL_VERSION = "0.1";
```

The current shared protocol version. Host and Guest packages should pin compatible package versions and check this value when they adopt the shared package.

## Types

### `EffectRequest`

Guest-to-Host effect request shape.

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

### `EffectResponse`

Host-to-Guest effect response shape.

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

### `RedactionSummary`

```ts
export interface RedactionSummary {
  stream: "stdout" | "stderr" | "error";
  count: number;
  reason: "secret" | "sensitive-pattern" | "policy";
}
```

### `GuestManifest`

```ts
export interface GuestManifest {
  version: string;
  capabilities: ManifestCapability[];
}
```

### `ManifestCapability`

```ts
export interface ManifestCapability {
  id: string;
  kind: "command";
  description: string;
  command?: {
    program: string;
    args: string[];
  };
  env: ManifestEnvReference[];
}
```

### `ManifestEnvReference`

```ts
export interface ManifestEnvReference {
  name: string;
  source?: "secret";
  exposedToGuest: false;
}
```

## Validators

### `validateEffectRequest(value)`

Returns `EffectRequest` when the value matches the protocol shape. Throws `ProtocolValidationError` on invalid input.

### `validateEffectResponse(value)`

Returns `EffectResponse` when the value matches the protocol shape. Throws `ProtocolValidationError` on invalid input.

### `validateGuestManifest(value)`

Returns `GuestManifest` when the value matches the safe manifest shape. It rejects env entries where `exposedToGuest` is not `false`.

### `validateRequestParams(value)`

Returns request params when they are safe for the protocol. It rejects forbidden execution and secret-bearing keys recursively:

- `command`
- `program`
- `args`
- `argv`
- `shell`
- `env`
- `timeout`
- `timeoutMs`
- `secret`
- `token`
- `credential`

## Errors

### `ProtocolValidationError`

Validation failures throw `ProtocolValidationError`.

```ts
export class ProtocolValidationError extends Error {
  readonly code: string;
  readonly message: string;
  readonly path: string;
}
```

The properties are:

- `code`: stable machine-readable error code
- `message`: human-readable validation message
- `path`: JSON-style path to the invalid field, such as `$.params.command`

No validator reads files or accesses `process.env`.
