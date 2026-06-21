/**
 * Tests for: KeywordResearchService
 * Covers:    PRD functional requirements 2-6 and 9
 * Level:     Unit
 */
import test from "node:test";
import assert from "node:assert/strict";

import {
  createKeywordResearchService,
  normalizeKeywords,
} from "../src/keyword-research-service.mjs";

test("normalizes newline and comma input and removes duplicates", () => {
  assert.deepEqual(
    normalizeKeywords(" Document scanner\nscanner with OCR,document scanner\n"),
    ["Document scanner", "scanner with OCR"],
  );
});

test("returns normalized metrics for a successful DataForSEO task", async () => {
  const service = createKeywordResearchService({
    login: "user@example.test",
    password: "secret",
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({
        status_code: 20000,
        tasks: [{
          status_code: 20000,
          result: [{
            keyword: "document scanner",
            search_volume: 2900,
            cpc: 3.44,
            competition: "HIGH",
            competition_index: 100,
            monthly_searches: [{ year: 2026, month: 5, search_volume: 2400 }],
          }],
        }],
      }),
    }),
  });

  const result = await service.getSearchVolume({
    keywords: ["document scanner"],
    locationCode: 2826,
    languageCode: "en",
  });

  assert.deepEqual(result, {
    ok: true,
    value: {
      market: { locationCode: 2826, languageCode: "en" },
      results: [{
        keyword: "document scanner",
        searchVolume: 2900,
        cpc: 3.44,
        competition: "HIGH",
        competitionIndex: 100,
        monthlySearches: [{ year: 2026, month: 5, searchVolume: 2400 }],
      }],
    },
  });
});

test("uses the selected market and language in the DataForSEO request", async () => {
  let sentBody;
  const service = createKeywordResearchService({
    login: "user@example.test",
    password: "secret",
    fetchImpl: async (_url, options) => {
      sentBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({ status_code: 20000, tasks: [{ status_code: 20000, result: [] }] }),
      };
    },
  });

  const result = await service.getSearchVolume({
    keywords: ["dokumentenscanner"], locationCode: 2276, languageCode: "de",
  });

  assert.equal(result.ok, true);
  assert.equal(sentBody[0].location_code, 2276);
  assert.equal(sentBody[0].language_code, "de");
  assert.deepEqual(result.value.market, { locationCode: 2276, languageCode: "de" });
});

test("preserves missing metrics as null rather than inventing zero", async () => {
  const service = createKeywordResearchService({
    login: "user@example.test",
    password: "secret",
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({
        status_code: 20000,
        tasks: [{ status_code: 20000, result: [{ keyword: "niche phrase", search_volume: null }] }],
      }),
    }),
  });

  const result = await service.getSearchVolume({
    keywords: ["niche phrase"], locationCode: 2826, languageCode: "en",
  });

  assert.equal(result.value.results[0].searchVolume, null);
});

test("rejects empty and oversized keyword lists before calling DataForSEO", async () => {
  const service = createKeywordResearchService({
    login: "user@example.test",
    password: "secret",
    fetchImpl: async () => assert.fail("fetch should not run"),
  });

  const empty = await service.getSearchVolume({ keywords: [], locationCode: 2826, languageCode: "en" });
  assert.equal(empty.error.type, "VALIDATION_FAILED");

  const oversized = await service.getSearchVolume({
    keywords: Array.from({ length: 1001 }, (_, index) => `keyword ${index}`),
    locationCode: 2826,
    languageCode: "en",
  });
  assert.equal(oversized.error.type, "VALIDATION_FAILED");
});

test("translates upstream rate and payment errors without exposing credentials", async () => {
  for (const [message, expectedType] of [
    ["The rates limit per minute has been exceeded", "RATE_LIMITED"],
    ["Payment Required", "PAYMENT_REQUIRED"],
  ]) {
    const service = createKeywordResearchService({
      login: "private-login",
      password: "private-password",
      fetchImpl: async () => ({
        ok: true,
        json: async () => ({
          status_code: 20000,
          tasks: [{ status_code: 40201, status_message: message, result: null }],
        }),
      }),
    });

    const result = await service.getSearchVolume({
      keywords: ["document scanner"], locationCode: 2826, languageCode: "en",
    });
    assert.equal(result.error.type, expectedType);
    assert.doesNotMatch(JSON.stringify(result), /private-login|private-password/);
  }
});

test("returns UNAUTHENTICATED when credentials are not configured", async () => {
  const service = createKeywordResearchService({ login: "", password: "" });
  const result = await service.getSearchVolume({
    keywords: ["document scanner"], locationCode: 2826, languageCode: "en",
  });
  assert.equal(result.error.type, "UNAUTHENTICATED");
});
