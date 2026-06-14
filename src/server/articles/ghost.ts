function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function encodeJwtPart(value: unknown) {
  return encodeBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function decodeHex(value: string) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) {
    throw new Error("Ghost Admin API credential has an invalid secret");
  }

  return Uint8Array.from(value.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
}

export async function createGhostAdminToken(apiKey: string) {
  const separatorIndex = apiKey.indexOf(":");
  if (separatorIndex <= 0 || separatorIndex === apiKey.length - 1) {
    throw new Error("Ghost Admin API credential must be in the form <id>:<secret>");
  }

  const id = apiKey.slice(0, separatorIndex);
  const secret = decodeHex(apiKey.slice(separatorIndex + 1));
  const now = Math.floor(Date.now() / 1000);
  const header = encodeJwtPart({ alg: "HS256", typ: "JWT", kid: id });
  const payload = encodeJwtPart({ iat: now, exp: now + 300, aud: "/admin/" });
  const unsignedToken = `${header}.${payload}`;
  const algorithm = { name: "HMAC", hash: "SHA-256" };
  const cryptoKey = await crypto.subtle.importKey("raw", secret, algorithm, false, ["sign"]);
  const signature = await crypto.subtle.sign(
    algorithm,
    cryptoKey,
    new TextEncoder().encode(unsignedToken),
  );

  return `${unsignedToken}.${encodeBase64Url(new Uint8Array(signature))}`;
}
