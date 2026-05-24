# Fixture Policy

Protocol fixtures are conformance examples.

They are used to verify that `EffectRequest`, `EffectResponse`, and `GuestManifest` shapes remain stable across changes. They are not Host runtime data, Guest runtime data, vault data, audit data, transport data, or secret material.

Rules:

- fixtures must contain only obviously fake values
- fixtures must not contain real secrets, realistic credentials, tokens, keys, PII, OAuth material, SSH keys, or browser session material
- fixtures must not be treated as Host-owned configuration
- fixtures must not be treated as Guest runtime state
- protocol shape changes require fixture updates

Host and Guest packages may copy these fixtures for compatibility tests until they depend on `@privenv/protocol` directly.
