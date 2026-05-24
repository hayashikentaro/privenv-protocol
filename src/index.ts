export const PROTOCOL_VERSION = "0.1" as const;

export type {
  EffectRequest,
  EffectResponse,
  GuestManifest,
  ManifestCapability,
  ManifestEnvReference,
  RedactionSummary
} from "./types.js";

export { ProtocolValidationError } from "./errors.js";
export {
  validateEffectRequest,
  validateEffectResponse,
  validateGuestManifest,
  validateRequestParams
} from "./validate.js";
