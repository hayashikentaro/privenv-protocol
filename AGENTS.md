# Agent Guardrails

This repository is `hayashikentaro/privenv-protocol`.

Future Codex agents must:

- Work only in this repository.
- Do not inspect `privenv-host`.
- Do not inspect `privenv-guest`.
- If Host or Guest details are needed, stop and request an explicit copied spec.
- Keep this package protocol-only.
- Do not implement Host runtime behavior.
- Do not implement Guest runtime behavior.
- Do not add transport unless explicitly requested.
- Do not add secret APIs.
- Do not read `.env`.
- Do not read or expose `process.env`.
- Do not add `getSecret()`, `getEnv()`, `rawEnv()`, raw vault readers, or raw `.env` readers.
- Keep examples fixture-only and obviously fake.

This package exists to define shared types, validators, fixtures, and documentation.
