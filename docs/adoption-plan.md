# Adoption Plan

`@privenv/protocol` exists to prevent protocol drift between privenv packages.

## Phase 1

Publish `@privenv/protocol` as `0.1.0` experimental.

The package remains protocol-only. It does not implement Host runtime behavior, Guest runtime behavior, transport, secret handling, vaults, `.env` loading, command execution, or passthrough behavior.

## Phase 2

Update `privenv-guest` to depend on `@privenv/protocol`.

Replace local duplicated protocol types and validators with imports where appropriate. Keep Guest-specific manifest file loading, capability listing, request creation, and CLI behavior local to the Guest package.

## Phase 3

Update `privenv-host` to depend on `@privenv/protocol`.

Replace local duplicated `EffectRequest`, `EffectResponse`, safe manifest types, and validators where appropriate. Keep Host-specific config, vault, audit, redaction, policy, execution context, runtime flow, and CLI behavior local to the Host package.

## Phase 4

Remove duplicated protocol fixtures only after compatibility tests are stable, or keep copied fixtures as conformance tests.

During the transition, Host and Guest packages may copy protocol fixtures explicitly. Protocol compatibility work must not require inspecting sibling repositories.
