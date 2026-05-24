# Concept

`@privenv/protocol` defines the shared protocol contract for privenv.

privenv separates trusted Host responsibilities from untrusted Guest responsibilities:

- Host owns secrets, policy, redaction, audit records, execution context, and approved effects.
- Guest reads safe manifests and creates effect requests.

This package does not act as either side. It provides common TypeScript types, lightweight validators, fixtures, and documentation so Host and Guest packages can agree on the same shapes.

It does not implement runtime behavior, command execution, transport, vault access, `.env` reading, secret handling, or passthrough behavior.
