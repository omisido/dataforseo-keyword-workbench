# Keyword Research Module

## 1. Module Identity

**Name:** `KeywordResearchService`

**Purpose:** Retrieve normalized search-volume metrics for a validated keyword set.

**Hides:** DataForSEO authentication, request formatting, response validation, error translation and metric normalization.

## 2. Public Interface

```js
class KeywordResearchService {
  async getSearchVolume(input) {}
}

// input
{
  keywords: string[],
  locationCode: number,
  languageCode: string
}

// success
{
  ok: true,
  value: { market: object, results: KeywordMetric[] }
}

// failure
{
  ok: false,
  error: {
    type: "VALIDATION_FAILED" | "UNAUTHENTICATED" | "RATE_LIMITED" |
      "PAYMENT_REQUIRED" | "UPSTREAM_UNAVAILABLE" | "UPSTREAM_ERROR",
    message: string
  }
}
```

## 3. Private Concerns

- Basic Authentication construction
- HTTPS transport and timeout
- DataForSEO task/status interpretation
- Null metric handling
- Duplicate removal and keyword limits
- Secret-safe error translation

## 4. Usage

```js
const result = await service.getSearchVolume({
  keywords: ["document scanner", "scanner with OCR"],
  locationCode: 2826,
  languageCode: "en"
})
```

## 5. Boundary Checklist

- [x] One public method
- [x] No upstream response types leak to callers
- [x] Errors are explicit
- [x] Transport can be replaced in tests
- [x] Callers do not need to understand DataForSEO authentication
