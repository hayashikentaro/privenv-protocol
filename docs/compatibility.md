# Compatibility

`privenv-host` and `privenv-guest` must agree on `EffectRequest`, `EffectResponse`, `RedactionSummary`, and safe manifest shapes.

This package is the future shared source of that contract. Host and Guest packages should depend on `@privenv/protocol` to avoid drift once integration work begins.

Until Host and Guest depend on this package, protocol changes should be coordinated by explicit copied specs, issue text, pull request text, release notes, or another agreed artifact. Protocol compatibility work must not require inspecting sibling repositories.

This package does not implement transport. Phase 1 stdio workflows and future Unix domain socket workflows remain outside this package.
