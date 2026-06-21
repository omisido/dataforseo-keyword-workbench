# Keyword Research API Contract

| Endpoint | Method | Authentication | Purpose |
|---|---|---|---|
| `/api/health` | GET | Local only | Confirm the server and credential configuration state |
| `/api/search-volume` | POST | Local only | Retrieve normalized keyword metrics |

## `GET /api/health`

Success `200`:

```json
{ "status": "ok", "configured": true }
```

The response never contains credentials.

Supported market presets:

| Market | Location code | Default language |
|---|---:|---|
| United Kingdom | 2826 | `en` |
| United States | 2840 | `en` |
| Germany | 2276 | `de` |
| Italy | 2380 | `it` |
| France | 2250 | `fr` |
| Spain | 2724 | `es` |

## `POST /api/search-volume`

Request:

```json
{
  "keywords": ["document scanner", "scanner with OCR"],
  "locationCode": 2826,
  "languageCode": "en"
}
```

Success `200`:

```json
{
  "market": { "locationCode": 2826, "languageCode": "en" },
  "results": [
    {
      "keyword": "document scanner",
      "searchVolume": 2900,
      "cpc": 3.44,
      "competition": "HIGH",
      "competitionIndex": 100,
      "monthlySearches": []
    }
  ]
}
```

Errors:

- `400 { "error": "VALIDATION_FAILED", "message": string }`
- `401 { "error": "UNAUTHENTICATED", "message": string }`
- `402 { "error": "PAYMENT_REQUIRED", "message": string }`
- `429 { "error": "RATE_LIMITED", "message": string }`
- `502 { "error": "UPSTREAM_ERROR", "message": string }`
- `503 { "error": "UPSTREAM_UNAVAILABLE", "message": string }`

Rate limiting is governed by the upstream DataForSEO account. Requests are not idempotent from a billing perspective, so the interface disables duplicate submission while one request is active.
