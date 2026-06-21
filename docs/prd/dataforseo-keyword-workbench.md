# DataForSEO Keyword Workbench PRD

## 1. Overview

**Feature name:** Keyword Workbench

**Problem statement:** SEO research currently requires repeated manual API calls and hand-formatted tables. A local interface should make exact-market keyword research fast while keeping DataForSEO credentials out of the browser.

**Success criteria:** A user can paste keywords, run a UK/English search-volume request, inspect and sort normalized results, understand failures, and export the result as CSV.

### Assumptions

- Node.js 20 or newer is available.
- DataForSEO credentials are provided as server-side environment variables.
- The first release supports Google Ads search-volume data only.
- The default market is United Kingdom (`2826`) and English (`en`). Supported alternatives are the United States, Germany, Italy, France and Spain with their local-language defaults.

## 2. User Stories

- As an SEO, I want to paste one keyword per line so that I can research a brief in one request.
- As an SEO, I want volume, CPC and paid competition in a sortable table so that I can prioritise terms.
- As an SEO, I want duplicate and blank phrases removed so that API requests stay clean.
- As an SEO, I want a clear validation message when the input is empty.
- As an SEO, I want actionable errors when credentials, rate limits, credit or the upstream service fail.
- As an SEO, I want to export the current results as CSV so that I can continue in a spreadsheet.

## 3. Functional Requirements

1. Accept newline- or comma-separated keywords.
2. Trim whitespace, remove blank values and deduplicate case-insensitively.
3. Limit a request to 1,000 unique keywords.
4. Submit requests through the local server; credentials must never reach browser code.
5. Return normalized keyword, search volume, CPC, competition and monthly history.
6. Show no-data values distinctly from numeric zero.
7. Sort table columns without repeating the API call.
8. Export visible results as UTF-8 CSV.
9. Display upstream errors using stable local error codes.
10. Provide a health endpoint that does not expose secrets.

## 4. Non-Functional Requirements

- Typical UI actions should respond within 100 ms, excluding DataForSEO latency.
- Server logs and responses must not expose credentials or authorization headers.
- The interface must be keyboard-operable and meet WCAG AA contrast.
- Support current Chrome, Safari, Firefox and Edge desktop browsers.
- No third-party runtime dependencies are required.

## 5. Scope

**In scope:** Exact Google Ads search volume, six selectable markets with UK/English defaults, local credential proxy, result table, sorting, CSV export, validation and error handling.

**Out of scope:** User accounts, cloud deployment, credential storage UI, billing, rank tracking, keyword suggestions and databases.

## 6. Open Questions

- Future versions may add selectable markets, SERP checks and keyword suggestions.

## 7. Acceptance Criteria

- [ ] Credentials exist only in server environment variables.
- [ ] Valid keywords return normalized DataForSEO metrics.
- [ ] Blank and duplicate keywords are removed before submission.
- [ ] Empty and oversized requests are rejected locally.
- [ ] Rate-limit, authentication, credit and upstream errors are understandable.
- [ ] Results can be sorted and exported.
- [ ] Automated behavioural tests pass.
- [ ] Desktop and mobile layouts are visually verified.
