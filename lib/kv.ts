import { createClient, type VercelKV } from "@vercel/kv";

/**
 * REST URL precedence:
 * 1) UPSTASH_* — names from Upstash / marketplace
 * 2) wander_KV_* (or other prefixed integration) — before generic KV_* so a stale
 *    `vercel env pull` KV_REST_* does not shadow a working linked store
 * 3) KV_REST_* — legacy Vercel KV env names
 */
function restUrl(): string | undefined {
  return (
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.wander_KV_REST_API_URL ||
    process.env.KV_REST_API_URL
  );
}

/** REST token with write access (not read-only). */
function restToken(): string | undefined {
  return (
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.wander_KV_REST_API_TOKEN ||
    process.env.KV_REST_API_TOKEN
  );
}

function createKv(): VercelKV {
  const url = restUrl();
  const token = restToken();
  if (!url || !token) {
    throw new Error(
      "Missing Redis REST credentials. Set UPSTASH_REDIS_REST_URL/TOKEN, wander_KV_REST_API_URL/TOKEN, or KV_REST_API_URL/TOKEN."
    );
  }
  return createClient({ url, token });
}

let _client: VercelKV | null = null;

function getClient(): VercelKV {
  if (!_client) {
    _client = createKv();
  }
  return _client;
}

/** Lazy Redis REST client compatible with `@vercel/kv` default export. */
export const kv = new Proxy({} as VercelKV, {
  get(_target, prop, _receiver) {
    if (prop === "then") {
      return undefined;
    }
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});

export const KV_SETUP_HINT =
  "Redis REST is not configured. Set UPSTASH_REDIS_REST_* or wander_KV_REST_API_* or KV_REST_* on Vercel / .env.local.";

export function isKvConfigError(message: string): boolean {
  return (
    message.includes("KV_REST_API_URL") ||
    message.includes("KV_REST_API_TOKEN") ||
    message.includes("Missing Redis REST credentials") ||
    message.includes("UPSTASH_REDIS_REST")
  );
}

function errorCauseChain(err: unknown): string {
  const parts: string[] = [];
  let e: unknown = err;
  const seen = new Set<unknown>();
  while (e instanceof Error && !seen.has(e) && parts.length < 8) {
    seen.add(e);
    parts.push(e.message);
    e = (e as Error & { cause?: unknown }).cause;
  }
  return parts.join(" ");
}

/** True when failure is likely DNS / URL / TLS to Redis REST (vs app logic). */
export function isKvConnectivityFailure(err: unknown): boolean {
  const chain = errorCauseChain(err);
  return /ENOTFOUND|getaddrinfo|EAI_AGAIN|fetch failed|certificate|SSL|TLS|UNABLE_TO_VERIFY/i.test(
    chain
  );
}

/** User-facing detail when KV HTTP calls fail (DNS, TLS, wrong URL, etc.). */
export function describeKvConnectivityError(err: unknown): string {
  const chain = errorCauseChain(err);
  if (/ENOTFOUND|getaddrinfo|EAI_AGAIN/i.test(chain)) {
    return (
      "Cannot resolve Redis REST hostname (check KV_REST_API_URL or UPSTASH URL). " +
      "The database may have been deleted or .env has an old URL — copy REST URL from the Upstash dashboard, or remove stale KV_* so wander_KV_* / UPSTASH_* is used."
    );
  }
  if (/certificate|SSL|TLS|UNABLE_TO_VERIFY/i.test(chain)) {
    return "TLS error talking to Redis REST; check system time and URL.";
  }
  return chain || "Storage request failed.";
}
