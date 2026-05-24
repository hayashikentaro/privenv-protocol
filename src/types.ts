export interface EffectRequest {
  id: string;
  type: "effect.request";
  capabilityId: string;
  params?: Record<string, unknown>;
  metadata?: {
    guestName?: string;
    guestRunId?: string;
    reason?: string;
  };
}

export interface EffectResponse {
  requestId: string;
  type: "effect.response";
  ok: boolean;
  result?: {
    exitCode?: number;
    stdout?: string;
    stderr?: string;
    redactions?: RedactionSummary[];
  };
  error?: {
    code: string;
    message: string;
  };
  auditId: string;
}

export interface RedactionSummary {
  stream: "stdout" | "stderr" | "error";
  count: number;
  reason: "secret" | "sensitive-pattern" | "policy";
}

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
