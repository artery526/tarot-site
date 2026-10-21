const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  },
});

export async function forwardInquiry(request, env, action) {
  if (request.method !== "POST") return json({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405);
  if (!env.TAROT_INQUIRY_SCRIPT_URL || !env.TAROT_INQUIRY_SECRET) {
    return json({ ok: false, code: "SERVICE_UNAVAILABLE" }, 503);
  }

  let endpoint;
  try {
    endpoint = new URL(env.TAROT_INQUIRY_SCRIPT_URL);
  } catch {
    return json({ ok: false, code: "SERVICE_UNAVAILABLE" }, 503);
  }
  if (endpoint.protocol !== "https:" || endpoint.hostname !== "script.google.com") {
    return json({ ok: false, code: "SERVICE_UNAVAILABLE" }, 503);
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > 12000) return json({ ok: false, code: "INVALID_INPUT" }, 413);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, code: "INVALID_INPUT" }, 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        payload,
        secret: env.TAROT_INQUIRY_SECRET,
        clientIp: request.headers.get("CF-Connecting-IP") || "unknown",
      }),
      signal: controller.signal,
    });
    const result = await upstream.json();
    if (result && typeof result.ok === "boolean") return json(result, upstream.ok ? 200 : upstream.status);
    return json({ ok: false, code: "SERVICE_UNAVAILABLE" }, 502);
  } catch {
    return json({ ok: false, code: "SERVICE_UNAVAILABLE" }, 502);
  } finally {
    clearTimeout(timeout);
  }
}
