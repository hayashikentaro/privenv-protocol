import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import {
  ProtocolValidationError,
  validateEffectRequest,
  validateEffectResponse,
  validateGuestManifest,
  validateRequestParams
} from "../src/index.js";

const fixtureDir = join("tests", "fixtures");

test("valid EffectRequest fixture parses", async () => {
  const value = await readFixture("effect-request.valid.json");
  const request = validateEffectRequest(value);

  assert.equal(request.type, "effect.request");
  assert.equal(request.capabilityId, "cmd.example.test");
});

test("EffectResponse success fixture parses", async () => {
  const value = await readFixture("effect-response.success.json");
  const response = validateEffectResponse(value);

  assert.equal(response.ok, true);
  assert.equal(response.result?.redactions?.[0]?.reason, "secret");
});

test("EffectResponse error fixture parses", async () => {
  const value = await readFixture("effect-response.error.json");
  const response = validateEffectResponse(value);

  assert.equal(response.ok, false);
  assert.equal(response.error?.code, "capability.not_found");
});

test("manifest fixture parses", async () => {
  const value = await readFixture("manifest.valid.json");
  const manifest = validateGuestManifest(value);

  assert.equal(manifest.capabilities[0]?.env[0]?.exposedToGuest, false);
});

test("request params reject forbidden keys recursively", () => {
  for (const key of ["command", "program", "args", "argv", "shell", "env", "timeout", "timeoutMs", "secret", "token", "credential"]) {
    assert.throws(
      () => validateRequestParams({ nested: { [key]: "blocked" } }),
      ProtocolValidationError,
      `${key} should be rejected`
    );
  }
});

test("request params reject obvious secret-like strings", () => {
  assert.throws(
    () => validateRequestParams({ note: "token=example-secret-value" }),
    ProtocolValidationError
  );
});

test("manifest env must not be exposed to Guest", async () => {
  const value = await readFixture("manifest.valid.json");
  value.capabilities[0].env[0].exposedToGuest = true;

  assert.throws(() => validateGuestManifest(value), ProtocolValidationError);
});

test("fixtures contain no raw secret-like values", async () => {
  const files = [
    "effect-request.valid.json",
    "effect-response.success.json",
    "effect-response.error.json",
    "manifest.valid.json"
  ];
  const forbidden = /-----BEGIN|bearer\s+|sk-[A-Za-z0-9_-]{8,}|(?:password|token|secret)\s*[:=]|fixture[_-]?secret|test[_-]?only/i;

  for (const file of files) {
    const text = await readFile(join(fixtureDir, file), "utf8");
    assert.equal(forbidden.test(text), false, `${file} contains a forbidden secret-like value`);
  }
});

test("request fixture contains no forbidden execution params", async () => {
  const value = await readFixture("effect-request.valid.json");
  assert.doesNotThrow(() => validateRequestParams(value.params));
});

async function readFixture(fileName: string): Promise<any> {
  const text = await readFile(join(fixtureDir, fileName), "utf8");
  return JSON.parse(text);
}
