# Security Boundary

This package preserves the privenv Host/Guest boundary by staying protocol-only.

It must not:

- read `.env`
- access `process.env`
- read Host vault files
- read Guest manifest files
- expose `getSecret()`
- expose `getEnv()`
- expose `rawEnv()`
- expose raw vault readers
- expose raw `.env` readers
- execute commands
- implement passthrough behavior

Validators reject obvious secret-like strings and forbidden request parameter keys. These checks are guardrails for protocol hygiene, not production secret scanning.
