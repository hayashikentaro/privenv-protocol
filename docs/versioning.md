# Versioning

Current protocol version: `0.1`.

The package version starts at `0.1.0`, and the protocol is experimental before `1.0`.

Breaking changes may occur before `1.0`, but they must still be intentional, documented, and covered by fixture updates. Host and Guest packages should pin compatible versions when they adopt `@privenv/protocol`.

Protocol shape changes require:

- TypeScript type updates
- validator updates
- fixture updates
- documentation updates
- compatibility notes when Host or Guest adoption is affected

Future major versions should follow semver:

- Patch versions fix bugs without changing protocol shape.
- Minor versions add compatible optional protocol features.
- Major versions change required fields, validation semantics, or compatibility-sensitive behavior.

The safe manifest has its own `version` string. The initial examples use `"0.1"`.
