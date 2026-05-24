# Manifest

Current protocol version: `0.1`.

The Guest manifest is a safe capability description. It is not a Host config file and must not contain raw secret values.

```ts
export interface GuestManifest {
  version: string;
  capabilities: ManifestCapability[];
}

export interface ManifestCapability {
  id: string;
  kind: "command";
  description: string;
  command?: {
    program: string;
    args: string[];
  };
  env: ManifestEnvReference[];
}

export interface ManifestEnvReference {
  name: string;
  source?: "secret";
  exposedToGuest: false;
}
```

Manifest env references name variables only. `exposedToGuest` must be `false`.

This package validates manifest shape but does not load manifest files and does not generate manifests from Host configuration.
