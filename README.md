# @privenv/protocol

Shared protocol types and dependency-free validators for privenv.

This package is protocol-only. It does not implement Host runtime behavior, Guest runtime behavior, transport, command execution, vaults, manifest generation from Host config, Guest manifest file loading, secret handling, `.env` reading, or passthrough behavior.

## Current Status

`@privenv/protocol` defines the common contract that privenv Host and Guest packages should depend on in the future to avoid protocol drift.

Current protocol version: `0.1`.

Host/Guest adoption is future work. This package is being hardened first so both sides can later depend on the same public API.

Host and Guest boundaries remain unchanged:

- Host owns configuration, vaults, audit logs, redaction, policy, execution context, and approved effects.
- Guest reads safe manifests and creates `EffectRequest` JSON.
- This package only defines shared shapes and validators.

## Install

Publication is future work. For now, this repository can be built and tested locally.

## Exports

- TypeScript types for `EffectRequest`, `EffectResponse`, `RedactionSummary`, and safe Guest manifests.
- `validateEffectRequest(value)`
- `validateEffectResponse(value)`
- `validateGuestManifest(value)`
- `validateRequestParams(value)`
- `ProtocolValidationError`

## Development Checks

```sh
npm run typecheck
npm test
npm run pack:check
```

CI runs the same checks on push and pull request.

## Documentation

- [Concept](docs/concept.md)
- [Public API](docs/api.md)
- [Protocol](docs/protocol.md)
- [Manifest](docs/manifest.md)
- [Compatibility](docs/compatibility.md)
- [Security Boundary](docs/security-boundary.md)
- [Versioning](docs/versioning.md)
- [Examples](docs/examples.md)
- [Fixture Policy](docs/fixtures.md)
- [Test Strategy](docs/test-strategy.md)
