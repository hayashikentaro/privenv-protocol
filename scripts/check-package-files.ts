import { createReadStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createGunzip } from "node:zlib";
import { Writable } from "node:stream";
import { pipeline } from "node:stream/promises";

const forbiddenPatterns = [
  /^package\/\.env(?:$|\.)/,
  /^package\/\.privenv\//,
  /^package\/node_modules\//,
  /^package\/src\//,
  /^package\/scripts\//,
  /^package\/tests\//,
  /^package\/dist\/tests\//,
  /^package\/dist\/scripts\//,
  /privenv\.host\.json$/,
  /privenv\.manifest\.json$/,
  /vault\.json$/,
  /audit\.log\.jsonl$/
];

const requiredFiles = new Set([
  "package/package.json",
  "package/README.md",
  "package/LICENSE",
  "package/dist/src/index.js",
  "package/dist/src/index.d.ts"
]);

const tarballName = await readStdin();
const trimmedTarballName = tarballName.trim();

if (trimmedTarballName.length === 0) {
  throw new Error("npm pack did not return a tarball name");
}

const tempDir = await mkdtemp(join(tmpdir(), "privenv-protocol-pack-"));
const files: string[] = [];

try {
  await pipeline(
    createReadStream(trimmedTarballName),
    createGunzip(),
    tarListCollector(files)
  );

  for (const file of files) {
    if (forbiddenPatterns.some((pattern) => pattern.test(file))) {
      throw new Error(`Forbidden package file: ${file}`);
    }
  }

  for (const requiredFile of requiredFiles) {
    if (!files.includes(requiredFile)) {
      throw new Error(`Missing required package file: ${requiredFile}`);
    }
  }
} finally {
  await rm(trimmedTarballName, { force: true });
  await rm(tempDir, { recursive: true, force: true });
}

function tarListCollector(files: string[]): Writable {
  let buffer = Buffer.alloc(0);

  return new Writable({
    write(chunk, _encoding, callback) {
      try {
        buffer = Buffer.concat([buffer, chunk as Buffer]);

        while (buffer.length >= 512) {
          const header = buffer.subarray(0, 512);
          if (header.every((byte) => byte === 0)) {
            buffer = buffer.subarray(512);
            continue;
          }

          const name = header.subarray(0, 100).toString("utf8").replace(/\0.*$/, "");
          const sizeText = header.subarray(124, 136).toString("utf8").replace(/\0.*$/, "").trim();
          const size = Number.parseInt(sizeText || "0", 8);
          const totalSize = 512 + Math.ceil(size / 512) * 512;

          if (buffer.length < totalSize) {
            break;
          }

          if (name.length > 0) {
            files.push(name);
          }

          buffer = buffer.subarray(totalSize);
        }

        callback();
      } catch (error) {
        callback(error as Error);
      }
    }
  });
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}
