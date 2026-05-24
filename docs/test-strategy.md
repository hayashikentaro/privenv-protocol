# Test Strategy

Tests are fixture-based and protocol-only.

Principles:

- never use real secrets
- use only obviously fake values
- validate `EffectRequest`, `EffectResponse`, and `GuestManifest` fixtures
- reject forbidden request parameter keys recursively
- reject obvious secret-like strings
- keep validators dependency-free
- do not read files from validators
- do not access `process.env` from validators
- verify package contents with `npm run pack:check`

This package does not test Host runtime behavior, Guest runtime behavior, transport, vaults, command execution, or manifest file loading.
