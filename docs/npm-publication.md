# npm Publication

`@privenv/protocol` is intended for experimental `0.1.x` publication.

It is not production-ready. Breaking changes may occur before `1.0`, and Host/Guest packages should pin compatible versions when they adopt it.

## Pre-Publish Checks

Run these checks locally before any manual publish:

```sh
npm run typecheck
npm test
npm run pack:check
npm pack --dry-run
```

Review the `npm pack --dry-run` output before publishing. The package should contain only safe intended files such as:

- `dist/src/`
- `README.md`
- `LICENSE`
- `docs/`
- `package.json`

It must not contain source files, tests, `.env` files, `.privenv/`, vault files, audit logs, Host runtime files, Guest runtime files, or local package caches.

## Manual Publish

Only a maintainer should publish:

```sh
npm publish --access public
```

Do not run `npm publish` as part of normal development.

## CI Policy

Do not publish from CI yet.

Do not:

- add npm tokens to this repository
- commit npm tokens
- add repository secrets for publication
- add release automation

Keep the package in the `0.x` experimental line until the protocol stabilizes.
