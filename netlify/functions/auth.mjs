// Netlify Function: Multi-provider OAuth 2.0 handler
//
// Uses Node.js crypto (not Web Crypto) for Netlify compatibility.
// Actions: login, callback, me, logout, providers

import { createHmac, createHash, randomBytes } from 'node:crypto';

// ── Provider Registry ──────────────────────────────────────────────

const BUILTIN_PROVIDERS = {
  github: {
    name: 'GitHub',
    authorize_url: 'https://github.com/login/oauth/authorize',
    token_url: 'https://github.com/login/oauth/access_token',
    userinfo_url: 'https://api.github.com/user',
    scope: 'read:user',
    token_headers: { Accept: 'application/json' },
    userinfo_headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'guestbook' },
    map_user: (d) => ({ uid: String(d.id), name: d.name || d.login, avatar: d.avatar_url }),
  },
  gitee: {
    name: 'Gitee',
    authorize_url: 'https://gitee.com/oauth/authorize',
    token_url: 'https://gitee.com/oauth/token',
    userinfo_url: 'https://gitee.com/api/v5/user',
    scope: 'user_info',
    map_user: (d) => ({ uid: String(d.id), name: d.login || d.name, avatar: d.avatar_url }),
  },
  gitlab: {
    name: 'GitLab',
    authorize_url: 'https://gitlab.com/oauth/authorize',
    token_url: 'https://gitlab.com/oauth/token',
    userinfo_url: 'https://gitlab.com/api/v4/user',
    scope: 'read_user',
    map_user: (d) => ({ uid: String(d.id), name: d.username, avatar: d.avatar_url }),
  },
  google: {
    name: 'Google',
    authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    token_url: 'https://oauth2.googleapis.com/token',
    userinfo_url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'openid profile',
    map_user: (d) => ({ uid: d.id, name: d.name || d.email, avatar: d.picture }),
  },
};

// ── Crypto Helpers (Node.js crypto) ───────────────────────────────

function base64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function base64urlDecode(str) {
  return Buffer.from(str, 'base64url');
}

function randomString(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = randomBytes(len);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

function sha256(input) {
  return createHash('sha256').update(input).digest();
}

function hmacSign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest();
}

// ── Session Token ──────────────────────────────────────────────────

const SESSION_MAX_AGE = 7 * 24 * 3600;

function getJwtSecret() {
  const secret = process.env.OAUTH_JWT_SECRET;
  if (!secret) throw new Error('OAUTH_JWT_SECRET not configured');
  return secret;
}

async function createSessionToken(user) {
  const payload = JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE });
  const payloadB64 = base64url(payload);
  const sig = base64url(hmacSign(payloadB64, getJwtSecret()));
  return `${payloadB64}.${sig}`;
}

async function verifySessionToken(token) {
  try {
    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) return null;
    const expectedSig = base64url(hmacSign(payloadB64, getJwtSecret()));
    if (sigB64 !== expectedSig) return null;
    const payloadStr = base64urlDecode(payloadB64).toString('utf-8');
    const payload = JSON.parse(payloadStr);
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { provider: payload.provider, uid: payload.uid, name: payload.name, avatar: payload.avatar };
  } catch { return null; }
}

// ── Provider Resolution ────────────────────────────────────────────

function getProvider(name) {
  const builtin = BUILTIN_PROVIDERS[name.toLowerCase()];
  const prefix = `OAUTH_${name.toUpperCase()}`;
  const clientId = process.env[`${prefix}_CLIENT_ID`];

  if (builtin) {
    return {
      ...builtin,
      client_id: clientId,
      client_secret: process.env[`${prefix}_CLIENT_SECRET`],
    };
  }
  // Custom provider
  if (clientId && process.env[`${prefix}_CLIENT_SECRET`]) {
    return {
      name,
      authorize_url: process.env[`${prefix}_AUTHORIZE_URL`],
      token_url: process.env[`${prefix}_TOKEN_URL`],
      userinfo_url: process.env[`${prefix}_USERINFO_URL`],
      scope: process.env[`${prefix}_SCOPE`] || 'profile',
      client_id: clientId,
      client_secret: process.env[`${prefix}_CLIENT_SECRET`],
      map_user: (d) => ({
        uid: String(d.id || d.sub || d.user_id),
        name: d.name || d.login || d.username || d.email,
        avatar: d.avatar || d.avatar_url || d.picture || '',
      }),
    };
  }
  return null;
}

function getConfiguredProviders() {
  const names = new Set(Object.keys(BUILTIN_PROVIDERS));
  for (const key of Object.keys(process.env)) {
    const m = key.match(/^OAUTH_([A-Z][A-Z0-9]*)_CLIENT_ID$/);
    if (m) names.add(m[1].toLowerCase());
  }
  const result = [];
  for (const name of names) {
    const p = getProvider(name);
    if (p && p.client_id) result.push({ key: name, name: p.name });
  }
  const order = ['github', 'google', 'gitlab', 'gitee'];
  result.sort((a, b) => (order.indexOf(a.key) ?? 99) - (order.indexOf(b.key) ?? 99));
  return result;
}

// ── Helpers ────────────────────────────────────────────────────────

function corsHeaders(origin) {
  const allowed = process.env.SITE_URL || origin || '*';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function parseCookies(h) {
  const out = {};
  if (!h) return out;
  for (const part of h.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return out;
}

// ── Main Handler ───────────────────────────────────────────────────

export const handler = async (event) => {
  const h = corsHeaders(event.headers?.origin);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: h };

  const params = event.queryStringParameters || {};
  const action = params.action || '';

  try {
    switch (action) {
      case 'login':       return await handleLogin(event, params, h);
      case 'callback':    return await handleCallback(event, params, h);
      case 'me':          return await handleMe(event, h);
      case 'logout':      return handleLogout(params, h);
      case 'providers':   return { statusCode: 200, headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ providers: getConfiguredProviders() }) };
      default:            return { statusCode: 200, headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ providers: getConfiguredProviders(), authenticated: false }) };
    }
  } catch (err) {
    return { statusCode: 500, headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.message }) };
  }
};

// ── Login ──────────────────────────────────────────────────────────

async function handleLogin(event, params, headers) {
  const name = (params.provider || '').toLowerCase();
  const p = getProvider(name);
  if (!p) return { statusCode: 400, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: `Unknown provider: ${name}` }) };

  const verifier = randomString(64);
  const state = randomString(32);
  const siteUrl = process.env.SITE_URL || `https://${event.headers.host}`;
  const redirectUri = `${siteUrl}/.netlify/functions/auth?action=callback`;
  const challenge = base64url(sha256(verifier));

  const authParams = new URLSearchParams({
    client_id: p.client_id,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
    scope: p.scope || 'profile',
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  const url = `${p.authorize_url}?${authParams.toString()}`;
  const cookie = `gb_oauth=${name}:${verifier}:${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`;

  return { statusCode: 302, headers: { ...headers, Location: url, 'Set-Cookie': cookie } };
}

// ── Callback ───────────────────────────────────────────────────────

async function handleCallback(event, params, headers) {
  const code = params.code;
  const state = params.state;
  if (!code) return { statusCode: 400, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing code' }) };

  const cookies = parseCookies(event.headers?.cookie || '');
  const oauth = (cookies['gb_oauth'] || '').split(':');
  const [providerName, codeVerifier, expectedState] = oauth;

  if (!providerName || !codeVerifier) {
    return { statusCode: 400, headers: { ...headers, 'Content-Type': 'text/html' }, body: '<html><body><p>Session expired. <a href="/guestbook">Try again</a></p></body></html>' };
  }
  if (state && expectedState && state !== expectedState) {
    return { statusCode: 400, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'State mismatch' }) };
  }

  const p = getProvider(providerName);
  if (!p) return { statusCode: 400, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unknown provider' }) };

  const siteUrl = process.env.SITE_URL || `https://${event.headers.host}`;
  const redirectUri = `${siteUrl}/.netlify/functions/auth?action=callback`;

  // Exchange code for token
  const tokenBody = new URLSearchParams({
    client_id: p.client_id,
    client_secret: p.client_secret,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  });

  const tokenRes = await fetch(p.token_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...(p.token_headers || {}) },
    body: tokenBody.toString(),
  });
  const tokenData = await tokenRes.json().catch(() => ({}));
  if (!tokenData.access_token) {
    return { statusCode: 400, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Token exchange failed', details: tokenData }) };
  }

  // Fetch user info
  const userRes = await fetch(p.userinfo_url, {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, ...(p.userinfo_headers || {}) },
  });
  const userData = await userRes.json().catch(() => ({}));
  const mapped = (p.map_user || ((d) => ({ uid: d.id, name: d.name, avatar: '' })))(userData);

  // Create session & redirect
  const token = await createSessionToken({ provider: providerName, ...mapped });
  const cookie = `gb_token=${token}; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax`;
  const guestbookUrl = `${siteUrl}/guestbook`;

  return { statusCode: 302, headers: { ...headers, Location: guestbookUrl, 'Set-Cookie': cookie } };
}

// ── Me ─────────────────────────────────────────────────────────────

async function handleMe(event, headers) {
  // Try cookie first, then Authorization header
  const cookies = parseCookies(event.headers?.cookie || '');
  let token = cookies['gb_session'] || cookies['gb_token'] || '';
  if (!token) {
    const m = (event.headers?.authorization || '').match(/^Bearer\s+(.+)$/i);
    if (m) token = m[1];
  }

  const user = token ? await verifySessionToken(token) : null;
  return {
    statusCode: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(user ? { authenticated: true, user } : { authenticated: false }),
  };
}

// ── Logout ─────────────────────────────────────────────────────────

function handleLogout(params, headers) {
  const redirect = params.redirect || '/guestbook';
  const siteUrl = process.env.SITE_URL || '';
  return {
    statusCode: 302,
    headers: {
      ...headers,
      Location: `${siteUrl}${redirect}`,
      'Set-Cookie': 'gb_token=; Path=/; Max-Age=0',
    },
  };
}
