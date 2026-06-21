import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { createKeywordResearchService } from "./keyword-research-service.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const publicDir = join(root, "public");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function json(response, status, body) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(payload);
}

async function parseJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error("Request is too large");
  }
  return JSON.parse(body || "{}");
}

const statusByError = {
  VALIDATION_FAILED: 400,
  UNAUTHENTICATED: 401,
  PAYMENT_REQUIRED: 402,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
  UPSTREAM_UNAVAILABLE: 503,
};

async function serveStatic(pathname, response) {
  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = normalize(join(publicDir, requested));
  if (!filePath.startsWith(publicDir)) return false;
  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream",
      "content-length": body.length,
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    });
    response.end(body);
    return true;
  } catch {
    return false;
  }
}

export function createAppServer({ service, configured = false } = {}) {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");

    if (request.method === "GET" && url.pathname === "/api/health") {
      return json(response, 200, { status: "ok", configured });
    }

    if (request.method === "POST" && url.pathname === "/api/search-volume") {
      let input;
      try {
        input = await parseJson(request);
      } catch {
        return json(response, 400, { error: "VALIDATION_FAILED", message: "Send valid JSON." });
      }

      const result = await service.getSearchVolume(input);
      if (!result.ok) {
        return json(response, statusByError[result.error.type] ?? 502, {
          error: result.error.type,
          message: result.error.message,
        });
      }
      return json(response, 200, result.value);
    }

    if (request.method === "GET" && await serveStatic(url.pathname, response)) return;
    json(response, 404, { error: "NOT_FOUND", message: "The requested resource was not found." });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const login = process.env.DATAFORSEO_LOGIN ?? "";
  const password = process.env.DATAFORSEO_PASSWORD ?? "";
  const port = Number(process.env.PORT ?? 4173);
  const service = createKeywordResearchService({ login, password });
  const server = createAppServer({ service, configured: Boolean(login && password) });
  server.listen(port, "127.0.0.1", () => {
    console.log(`Keyword Workbench: http://127.0.0.1:${port}`);
  });
}
