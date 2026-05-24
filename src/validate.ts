import { ProtocolValidationError } from "./errors.js";
import type {
  EffectRequest,
  EffectResponse,
  GuestManifest,
  ManifestCapability,
  ManifestEnvReference,
  RedactionSummary
} from "./types.js";

const FORBIDDEN_PARAM_KEYS = new Set([
  "command",
  "program",
  "args",
  "argv",
  "shell",
  "env",
  "timeout",
  "timeoutMs",
  "secret",
  "token",
  "credential"
]);

const SECRET_LIKE_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bbearer\s+[A-Za-z0-9._-]{8,}/i,
  /\bsk-[A-Za-z0-9_-]{8,}/,
  /\b(?:password|token|secret)\s*[:=]\s*["']?[^"',\s}]+/i,
  /fixture[_-]?secret/i,
  /test[_-]?only[_-]?(?:secret|token|credential)/i
];

export function validateEffectRequest(value: unknown): EffectRequest {
  const object = expectObject(value, "$");
  const id = expectSafeString(object.id, "$.id");
  const type = expectLiteral(object.type, "effect.request", "$.type");
  const capabilityId = expectSafeString(object.capabilityId, "$.capabilityId");
  const params = validateRequestParams(object.params);
  const metadata = validateMetadata(object.metadata);

  return {
    id,
    type,
    capabilityId,
    ...(params === undefined ? {} : { params }),
    ...(metadata === undefined ? {} : { metadata })
  };
}

export function validateEffectResponse(value: unknown): EffectResponse {
  const object = expectObject(value, "$");
  const requestId = expectSafeString(object.requestId, "$.requestId");
  const type = expectLiteral(object.type, "effect.response", "$.type");
  const ok = expectBoolean(object.ok, "$.ok");
  const auditId = expectSafeString(object.auditId, "$.auditId");
  const result = validateResponseResult(object.result);
  const error = validateResponseError(object.error);

  if (!ok && error === undefined) {
    throw invalid("protocol.validation_error", "error is required when ok is false", "$.error");
  }

  return {
    requestId,
    type,
    ok,
    ...(result === undefined ? {} : { result }),
    ...(error === undefined ? {} : { error }),
    auditId
  };
}

export function validateGuestManifest(value: unknown): GuestManifest {
  const object = expectObject(value, "$");
  const version = expectSafeString(object.version, "$.version");
  const capabilitiesValue = object.capabilities;

  if (!Array.isArray(capabilitiesValue)) {
    throw invalid("protocol.validation_error", "capabilities must be an array", "$.capabilities");
  }

  return {
    version,
    capabilities: capabilitiesValue.map((capability, index) =>
      validateManifestCapability(capability, `$.capabilities[${index}]`)
    )
  };
}

export function validateRequestParams(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined) {
    return undefined;
  }

  const object = expectObject(value, "$.params");
  validateParamObject(object, "$.params");
  return object;
}

function validateMetadata(value: unknown): EffectRequest["metadata"] | undefined {
  if (value === undefined) {
    return undefined;
  }

  const object = expectObject(value, "$.metadata");
  return {
    ...(object.guestName === undefined ? {} : { guestName: expectSafeString(object.guestName, "$.metadata.guestName") }),
    ...(object.guestRunId === undefined ? {} : { guestRunId: expectSafeString(object.guestRunId, "$.metadata.guestRunId") }),
    ...(object.reason === undefined ? {} : { reason: expectSafeString(object.reason, "$.metadata.reason") })
  };
}

function validateResponseResult(value: unknown): EffectResponse["result"] | undefined {
  if (value === undefined) {
    return undefined;
  }

  const object = expectObject(value, "$.result");
  const redactionsValue = object.redactions;
  let redactions: RedactionSummary[] | undefined;

  if (redactionsValue !== undefined) {
    if (!Array.isArray(redactionsValue)) {
      throw invalid("protocol.validation_error", "redactions must be an array", "$.result.redactions");
    }
    redactions = redactionsValue.map((entry, index) => validateRedactionSummary(entry, `$.result.redactions[${index}]`));
  }

  return {
    ...(object.exitCode === undefined ? {} : { exitCode: expectNumber(object.exitCode, "$.result.exitCode") }),
    ...(object.stdout === undefined ? {} : { stdout: expectPossiblyEmptySafeString(object.stdout, "$.result.stdout") }),
    ...(object.stderr === undefined ? {} : { stderr: expectPossiblyEmptySafeString(object.stderr, "$.result.stderr") }),
    ...(redactions === undefined ? {} : { redactions })
  };
}

function validateResponseError(value: unknown): EffectResponse["error"] | undefined {
  if (value === undefined) {
    return undefined;
  }

  const object = expectObject(value, "$.error");
  return {
    code: expectSafeString(object.code, "$.error.code"),
    message: expectSafeString(object.message, "$.error.message")
  };
}

function validateRedactionSummary(value: unknown, path: string): RedactionSummary {
  const object = expectObject(value, path);
  return {
    stream: expectOneOf(object.stream, ["stdout", "stderr", "error"], `${path}.stream`),
    count: expectNumber(object.count, `${path}.count`),
    reason: expectOneOf(object.reason, ["secret", "sensitive-pattern", "policy"], `${path}.reason`)
  };
}

function validateManifestCapability(value: unknown, path: string): ManifestCapability {
  const object = expectObject(value, path);
  const envValue = object.env;

  if (!Array.isArray(envValue)) {
    throw invalid("protocol.validation_error", "env must be an array", `${path}.env`);
  }

  return {
    id: expectSafeString(object.id, `${path}.id`),
    kind: expectLiteral(object.kind, "command", `${path}.kind`),
    description: expectSafeString(object.description, `${path}.description`),
    ...(object.command === undefined ? {} : { command: validateManifestCommand(object.command, `${path}.command`) }),
    env: envValue.map((entry, index) => validateManifestEnv(entry, `${path}.env[${index}]`))
  };
}

function validateManifestCommand(value: unknown, path: string): ManifestCapability["command"] {
  const object = expectObject(value, path);
  const argsValue = object.args;

  if (!Array.isArray(argsValue)) {
    throw invalid("protocol.validation_error", "args must be an array", `${path}.args`);
  }

  return {
    program: expectSafeString(object.program, `${path}.program`),
    args: argsValue.map((arg, index) => expectSafeString(arg, `${path}.args[${index}]`))
  };
}

function validateManifestEnv(value: unknown, path: string): ManifestEnvReference {
  const object = expectObject(value, path);

  if (object.exposedToGuest !== false) {
    throw invalid("protocol.validation_error", "manifest env exposedToGuest must be false", `${path}.exposedToGuest`);
  }

  if (object.source !== undefined && object.source !== "secret") {
    throw invalid("protocol.validation_error", "manifest env source must be secret when present", `${path}.source`);
  }

  return {
    name: expectString(object.name, `${path}.name`),
    ...(object.source === undefined ? {} : { source: "secret" }),
    exposedToGuest: false
  };
}

function validateParamObject(value: Record<string, unknown>, path: string): void {
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_PARAM_KEYS.has(key)) {
      throw invalid("protocol.request_params_invalid", `request params must not include ${key}`, `${path}.${key}`);
    }

    if (typeof child === "string") {
      assertSafeString(child, `${path}.${key}`);
    } else if (Array.isArray(child)) {
      child.forEach((item, index) => validateParamValue(item, `${path}.${key}[${index}]`));
    } else if (isRecord(child)) {
      validateParamObject(child, `${path}.${key}`);
    }
  }
}

function validateParamValue(value: unknown, path: string): void {
  if (typeof value === "string") {
    assertSafeString(value, path);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => validateParamValue(item, `${path}[${index}]`));
  } else if (isRecord(value)) {
    validateParamObject(value, path);
  }
}

function expectObject(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw invalid("protocol.validation_error", "value must be an object", path);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function expectString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw invalid("protocol.validation_error", "value must be a non-empty string", path);
  }
  return value;
}

function expectSafeString(value: unknown, path: string): string {
  const stringValue = expectString(value, path);
  assertSafeString(stringValue, path);
  return stringValue;
}

function expectPossiblyEmptySafeString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw invalid("protocol.validation_error", "value must be a string", path);
  }
  assertSafeString(value, path);
  return value;
}

function assertSafeString(value: string, path: string): void {
  if (SECRET_LIKE_PATTERNS.some((pattern) => pattern.test(value))) {
    throw invalid("protocol.secret_like_value", "value looks like a raw secret", path);
  }
}

function expectBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    throw invalid("protocol.validation_error", "value must be a boolean", path);
  }
  return value;
}

function expectNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw invalid("protocol.validation_error", "value must be a finite number", path);
  }
  return value;
}

function expectLiteral<T extends string>(value: unknown, expected: T, path: string): T {
  if (value !== expected) {
    throw invalid("protocol.validation_error", `value must be ${expected}`, path);
  }
  return expected;
}

function expectOneOf<T extends string>(value: unknown, expected: readonly T[], path: string): T {
  if (typeof value !== "string" || !expected.includes(value as T)) {
    throw invalid("protocol.validation_error", `value must be one of ${expected.join(", ")}`, path);
  }
  assertSafeString(value, path);
  return value as T;
}

function invalid(code: string, message: string, path: string): ProtocolValidationError {
  return new ProtocolValidationError(code, message, path);
}
