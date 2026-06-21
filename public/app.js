const form = document.querySelector("#researchForm");
const keywordsInput = document.querySelector("#keywords");
const keywordCount = document.querySelector("#keywordCount");
const runButton = document.querySelector("#runButton");
const exportButton = document.querySelector("#exportButton");
const clearButton = document.querySelector("#clearButton");
const resultsBody = document.querySelector("#resultsBody");
const resultsSummary = document.querySelector("#resultsSummary");
const message = document.querySelector("#message");
const connectionBadge = document.querySelector("#connectionBadge");
const metricKeywords = document.querySelector("#metricKeywords");
const metricNonzero = document.querySelector("#metricNonzero");
const metricVolume = document.querySelector("#metricVolume");
const locationSelect = document.querySelector("#location");
const languageSelect = document.querySelector("#language");
const headerMarket = document.querySelector("#headerMarket");

let results = [];
let sort = { key: "searchVolume", direction: "desc" };

function parseKeywords(value) {
  const seen = new Set();
  return value.split(/[\n,]+/).map((term) => term.replace(/[\u200B-\u200D\uFEFF]/g, "").trim()).filter((term) => {
    const key = term.toLocaleLowerCase("en");
    if (!term || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function setMessage(text = "", kind = "info") {
  message.hidden = !text;
  message.textContent = text;
  message.dataset.kind = kind;
}

function formatNumber(value) {
  return value == null ? "n/a" : new Intl.NumberFormat("en-GB").format(value);
}

function formatCpc(value) {
  return value == null ? "n/a" : `$${Number(value).toFixed(2)}`;
}

function selectedMarket() {
  const option = locationSelect.selectedOptions[0];
  return {
    locationCode: Number(option.value),
    marketName: option.textContent,
    shortName: option.dataset.shortName,
    languageCode: languageSelect.value,
    languageName: languageSelect.selectedOptions[0].textContent,
  };
}

function updateMarketContext() {
  const option = locationSelect.selectedOptions[0];
  languageSelect.value = option.dataset.language;
  headerMarket.textContent = `Google Ads · ${option.textContent}`;
}

function compare(a, b, key) {
  const left = a[key];
  const right = b[key];
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === "string") return left.localeCompare(right, "en", { sensitivity: "base" });
  return left - right;
}

function render() {
  const sorted = [...results].sort((a, b) => compare(a, b, sort.key) * (sort.direction === "asc" ? 1 : -1));
  document.querySelectorAll(".sort-button").forEach((button) => {
    button.dataset.direction = button.dataset.key === sort.key ? sort.direction : "";
    button.closest("th").setAttribute("aria-sort", button.dataset.key === sort.key ? (sort.direction === "asc" ? "ascending" : "descending") : "none");
  });

  if (!sorted.length) {
    resultsBody.innerHTML = '<tr class="empty-row"><td colspan="5"><span class="empty-icon" aria-hidden="true">↗</span><strong>Ready for a keyword set</strong><span>Your results will appear here after the first request.</span></td></tr>';
    return;
  }

  resultsBody.innerHTML = sorted.map((row) => {
    const competition = row.competition ?? "n/a";
    return `<tr>
      <td>${escapeHtml(row.keyword)}</td>
      <td class="numeric">${formatNumber(row.searchVolume)}</td>
      <td class="numeric">${formatCpc(row.cpc)}</td>
      <td><span class="competition ${competition.toLowerCase()}">${escapeHtml(competition)}</span></td>
      <td class="numeric">${formatNumber(row.competitionIndex)}</td>
    </tr>`;
  }).join("");
}

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = String(value ?? "");
  return node.innerHTML;
}

async function checkHealth() {
  try {
    const response = await fetch("/api/health");
    const health = await response.json();
    connectionBadge.textContent = health.configured ? "API configured" : "Credentials required";
    connectionBadge.dataset.state = health.configured ? "ready" : "missing";
  } catch {
    connectionBadge.textContent = "Server unavailable";
    connectionBadge.dataset.state = "missing";
  }
}

keywordsInput.addEventListener("input", () => {
  const count = parseKeywords(keywordsInput.value).length;
  keywordCount.textContent = `${count} keyword${count === 1 ? "" : "s"}`;
});

clearButton.addEventListener("click", () => {
  keywordsInput.value = "";
  keywordsInput.dispatchEvent(new Event("input"));
  keywordsInput.focus();
});

locationSelect.addEventListener("change", updateMarketContext);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const keywords = parseKeywords(keywordsInput.value);
  if (!keywords.length) return setMessage("Enter at least one keyword.", "error");

  setMessage();
  runButton.disabled = true;
  runButton.innerHTML = '<span>Researching…</span><span aria-hidden="true">···</span>';
  const market = selectedMarket();
  try {
    const response = await fetch("/api/search-volume", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        keywords,
        locationCode: market.locationCode,
        languageCode: market.languageCode,
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message ?? "The request could not be completed.");

    results = payload.results;
    resultsSummary.textContent = `${results.length} keyword${results.length === 1 ? "" : "s"} · ${market.marketName} · ${market.languageName}`;
    metricKeywords.textContent = formatNumber(results.length);
    metricNonzero.textContent = formatNumber(results.filter((row) => (row.searchVolume ?? 0) > 0).length);
    metricVolume.textContent = formatNumber(results.reduce((total, row) => total + (row.searchVolume ?? 0), 0));
    exportButton.disabled = results.length === 0;
    render();
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    runButton.disabled = false;
    runButton.innerHTML = '<span>Run keyword research</span><span aria-hidden="true">→</span>';
  }
});

document.querySelectorAll(".sort-button").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.key;
    sort = { key, direction: sort.key === key && sort.direction === "desc" ? "asc" : "desc" };
    render();
  });
});

exportButton.addEventListener("click", () => {
  const header = ["Keyword", "Search volume", "CPC USD", "Competition", "Competition index"];
  const rows = results.map((row) => [row.keyword, row.searchVolume ?? "", row.cpc ?? "", row.competition ?? "", row.competitionIndex ?? ""]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const market = selectedMarket();
  link.download = `keyword-research-${market.shortName.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
});

checkHealth();
updateMarketContext();
render();
