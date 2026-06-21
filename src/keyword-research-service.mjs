const ENDPOINT = "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live";

export function normalizeKeywords(input) {
  const values = Array.isArray(input)
    ? input
    : String(input ?? "").split(/[\n,]+/);
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const keyword = String(value).replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
    const key = keyword.toLocaleLowerCase("en");
    if (!keyword || seen.has(key)) continue;
    seen.add(key);
    result.push(keyword);
  }
  return result;
}

function failure(type, message) {
  return { ok: false, error: { type, message } };
}

function translateError(message = "") {
  const text = String(message).toLowerCase();
  if (text.includes("rate") && text.includes("limit")) {
    return failure("RATE_LIMITED", "DataForSEO's request limit was reached. Wait a minute and try again.");
  }
  if (text.includes("payment required") || text.includes("insufficient")) {
    return failure("PAYMENT_REQUIRED", "The DataForSEO account does not have enough available credit.");
  }
  if (text.includes("auth") || text.includes("credential") || text.includes("login")) {
    return failure("UNAUTHENTICATED", "The DataForSEO credentials were rejected.");
  }
  return failure("UPSTREAM_ERROR", "DataForSEO could not complete this request.");
}

function normalizeMetric(item) {
  return {
    keyword: item.keyword,
    searchVolume: item.search_volume ?? null,
    cpc: item.cpc ?? null,
    competition: item.competition ?? null,
    competitionIndex: item.competition_index ?? null,
    monthlySearches: (item.monthly_searches ?? []).map((month) => ({
      year: month.year,
      month: month.month,
      searchVolume: month.search_volume ?? null,
    })),
  };
}

export function createKeywordResearchService({
  login = "",
  password = "",
  fetchImpl = globalThis.fetch,
} = {}) {
  return {
    async getSearchVolume({ keywords, locationCode = 2826, languageCode = "en" } = {}) {
      if (!login || !password) {
        return failure("UNAUTHENTICATED", "Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD, then restart the server.");
      }

      const normalized = normalizeKeywords(keywords);
      if (normalized.length === 0) {
        return failure("VALIDATION_FAILED", "Enter at least one keyword.");
      }
      if (normalized.length > 1000) {
        return failure("VALIDATION_FAILED", "A request can contain at most 1,000 unique keywords.");
      }
      if (!Number.isInteger(locationCode) || !languageCode) {
        return failure("VALIDATION_FAILED", "Choose a valid market and language.");
      }

      try {
        const response = await fetchImpl(ENDPOINT, {
          method: "POST",
          headers: {
            authorization: `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`,
            "content-type": "application/json",
          },
          body: JSON.stringify([{ location_code: locationCode, language_code: languageCode, keywords: normalized }]),
          signal: AbortSignal.timeout(45_000),
        });

        if (response.status === 401) return translateError("authentication");
        if (response.status === 402) return translateError("payment required");
        if (response.status === 429) return translateError("rate limit");
        if (!response.ok) return failure("UPSTREAM_ERROR", `DataForSEO returned HTTP ${response.status}.`);

        const payload = await response.json();
        if (payload.status_code !== 20000) return translateError(payload.status_message);
        const task = payload.tasks?.[0];
        if (!task || task.status_code !== 20000) return translateError(task?.status_message);

        return {
          ok: true,
          value: {
            market: { locationCode, languageCode },
            results: (task.result ?? []).map(normalizeMetric),
          },
        };
      } catch (error) {
        if (error?.name === "TimeoutError" || error?.name === "AbortError") {
          return failure("UPSTREAM_UNAVAILABLE", "DataForSEO did not respond before the request timed out.");
        }
        return failure("UPSTREAM_UNAVAILABLE", "DataForSEO is temporarily unreachable. Check the connection and try again.");
      }
    },
  };
}
