/**
 * Tests for: Local keyword research API
 * Covers:    API contract and PRD acceptance criteria
 * Level:     Integration
 */
import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";

import { createAppServer } from "../src/server.mjs";

async function requestServer(service, configured, { method = "GET", url = "/", body = "" }) {
  const server = createAppServer({ service, configured });
  const request = Readable.from(body ? [body] : []);
  request.method = method;
  request.url = url;

  return new Promise((resolve) => {
    const response = {
      statusCode: 200,
      headers: {},
      writeHead(statusCode, headers) {
        this.statusCode = statusCode;
        this.headers = headers;
      },
      end(payload = "") {
        resolve({ status: this.statusCode, body: payload ? JSON.parse(payload) : null });
      },
    };
    server.emit("request", request, response);
  });
}

test("health reports configuration state without credentials", async () => {
  const response = await requestServer({}, true, { url: "/api/health" });
  assert.deepEqual(response.body, { status: "ok", configured: true });
  assert.doesNotMatch(JSON.stringify(response.body), /password|authorization/i);
});

test("search-volume returns normalized service results", async () => {
  const service = {
    getSearchVolume: async () => ({
      ok: true,
      value: {
        market: { locationCode: 2826, languageCode: "en" },
        results: [{ keyword: "document scanner", searchVolume: 2900, cpc: 3.44 }],
      },
    }),
  };

  const response = await requestServer(service, true, {
    method: "POST",
    url: "/api/search-volume",
    body: JSON.stringify({ keywords: ["document scanner"], locationCode: 2826, languageCode: "en" }),
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.results[0].searchVolume, 2900);
});

test("search-volume rejects malformed JSON", async () => {
  const response = await requestServer({}, true, { method: "POST", url: "/api/search-volume", body: "{" });
  assert.equal(response.status, 400);
  assert.equal(response.body.error, "VALIDATION_FAILED");
});

test("search-volume maps service failures to contract status codes", async () => {
  const cases = [
    ["VALIDATION_FAILED", 400],
    ["UNAUTHENTICATED", 401],
    ["PAYMENT_REQUIRED", 402],
    ["RATE_LIMITED", 429],
    ["UPSTREAM_ERROR", 502],
    ["UPSTREAM_UNAVAILABLE", 503],
  ];

  for (const [type, expectedStatus] of cases) {
    const service = { getSearchVolume: async () => ({ ok: false, error: { type, message: "Safe message" } }) };
    const response = await requestServer(service, true, {
      method: "POST",
      url: "/api/search-volume",
      body: JSON.stringify({ keywords: ["term"], locationCode: 2826, languageCode: "en" }),
    });
    assert.equal(response.status, expectedStatus);
    assert.deepEqual(response.body, { error: type, message: "Safe message" });
  }
});
