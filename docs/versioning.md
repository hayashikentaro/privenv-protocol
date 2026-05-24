# Versioning

The initial package version is `0.1.0`.

Protocol changes should be treated as compatibility-sensitive:

- Additive optional fields may be minor-version changes.
- Required field changes should be major-version changes.
- Changes that relax or tighten security-sensitive validation must be documented clearly.

The safe manifest has its own `version` string. The initial examples use `"0.1"`.

Future Host and Guest packages should depend on this package instead of duplicating protocol types.
