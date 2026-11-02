/**
 * Preload patch for the headless smoke test (`npm run smoke`).
 *
 * `server-only` is a bundler marker: Next maps it to an empty module, but plain
 * Node throws on purpose. Mapping it to a no-op stub lets the exact same service
 * code run from the command line, without a Next.js build (which needs far more
 * RAM than a small CI box has).
 */
const Module = require("node:module");
const path = require("node:path");

const stub = path.join(__dirname, "server-only-stub.cjs");
const original = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === "server-only") return stub;
  return original.call(this, request, ...rest);
};
