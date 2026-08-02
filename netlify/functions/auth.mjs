// Netlify Function: Multi-provider OAuth 2.0 handler
//
// Supports any OAuth 2.0 provider with standard endpoints.
// Built-in providers: GitHub, Google, GitLab, Gitee.
// Add custom providers via env vars: OAUTH_<NAME>_CLIENT_ID, etc.
//
// Actions:
//   ?action=login&provider=xxx    — start OAuth flow
//   ?action=callback              — handle OAuth callback
//   ?action=me                    — return current user
//   ?action=logout                — clear session

// ── Provider Registry ──────────────────────────────────────────────

const BUILTIN_PROVIDERS = {
  github: {
    name: 'GitHub',
    authorize_url: 'https://github.com/login/oauth/authorize',
    token_url: 'https://github.com/login/oauth/access_token',
    userinfo_url: 'https://api.github.com/user',
    scope: 'read:user',
    // GitHub returns user info at /user, needs header Accept: application/json
    token_headers: { Accept: 'application/json' },
    userinfo_headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'guestbook' },
    map_user: (data) => ({ uid: String(data.id), name: data.login, avatar: data.avatar_url }),
  },
  gitlab: {
    name: 'GitLab',
    authorize_url: 'https://gitlab.com/oauth/authorize',
    token_url: 'https://gitlab.com/oauth/token',
    userinfo_url: 'https://gitlab.com/api/v4/user',
    scope: 'read_user',
    map_user: (data) => ({ uid: String(data.id), name: data.username, avatar: data.avatar_url }),
  },
  google: {
    name: 'Google',
    authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    token_url: 'https://oauth2.googleapis.com/token',
    userinfo_url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'openid profile',
    map_user: (data) => ({ uid: data.id, name: data.name || data.email, avatar: data.picture }),
  },
  gitee: {
    name: 'Gitee',
    authorize_url: 'https://gitee.com/oauth/authorize',
    token_url: 'https://gitee.com/oauth/token',
    userinfo_url: 'https://gitee.com/api/v5/user',
    scope: 'user_info',
    map_user: (data) => ({ uid: String(data.id), name: data.login || data.name, avatar: data.avatar_url }),
  },
};

// ── Helpers ────────────────────────────────────────────────────────

function base64url(bytes) {
  const str = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

function randomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join('');
}

async function sha256(input) {
  const enc = new TextEncoder().encode(input);
  return new Uint8Array(await crypto.subtle.digest('SHA-256', enc));
}

async function hmacSign(payload, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return new Uint8Array(sig);
}

// ── Session Token ──────────────────────────────────────────────────

const SESSION_COOKIE = 'gb_session';
const SESSION_MAX_AGE = 7 * 24 * 3600; // 7 days

function getJwtSecret() {
  return process.env.OAUTH_JWT_SECRET || 'dev-secret-change-me-in-production';
}

async function createSessionToken(user) {
  const payload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64url(new TextEncoder().encode(payloadStr));
  const sig = base64url(await hmacSign(payloadB64, getJwtSecret()));
  return `${payloadB64}.${sig}`;
}

async function verifySessionToken(token) {
  try {
    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) return null;
    const expectedSig = base64url(await hmacSign(payloadB64, getJwtSecret()));
    if (sigB64 !== expectedSig) return null;
    const payloadStr = new TextDecoder().decode(base64urlDecode(payloadB64));
    const payload = JSON.parse(payloadStr);
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { provider: payload.provider, uid: payload.uid, name: payload.name, avatar: payload.avatar };
  } catch {
    return null;
  }
}

function getSessionCookie(token, maxAge) {
  const isLocal = (process.env.SITE_URL || '').includes('localhost');
  return [
    `${SESSION_COOKIE}=${token}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${maxAge}`,
    'SameSite=Lax',
    ...(isLocal ? [] : ['Secure']),
  ].join('; ');
}

// ── Provider Resolution ────────────────────────────────────────────

function getProvider(name) {
  const builtin = BUILTIN_PROVIDERS[name.toLowerCase()];
  const prefix = `OAUTH_${name.toUpperCase()}`;
  const clientId = process.env[`${prefix}_CLIENT_ID`];
  const clientSecret = process.env[`${prefix}_CLIENT_SECRET`];

  if (builtin) {
    // Env overrides for built-in providers
    return {
      ...builtin,
      client_id: clientId || process.env[`OAUTH_${builtin.name.toUpperCase()}_CLIENT_ID`],
      client_secret: clientSecret || process.env[`OAUTH_${builtin.name.toUpperCase()}_CLIENT_SECRET`],
    };
  }

  // Custom provider — all endpoints from env vars
  if (clientId && clientSecret) {
    return {
      name: name,
      authorize_url: process.env[`${prefix}_AUTHORIZE_URL`],
      token_url: process.env[`${prefix}_TOKEN_URL`],
      userinfo_url: process.env[`${prefix}_USERINFO_URL`],
      scope: process.env[`${prefix}_SCOPE`] || 'profile',
      client_id: clientId,
      client_secret: clientSecret,
      map_user: (data) => ({
        uid: String(data.id || data.sub || data.user_id),
        name: data.name || data.login || data.username || data.email,
        avatar: data.avatar || data.avatar_url || data.picture || '',
      }),
    };
  }

  return null;
}

// Get all configured (enabled) providers for the login UI
function getConfiguredProviders() {
  const names = new Set(Object.keys(BUILTIN_PROVIDERS));

  // Also scan env for custom providers
  for (const key of Object.keys(process.env)) {
    const m = key.match(/^OAUTH_([A-Z][A-Z0-9]*)_CLIENT_ID$/);
    if (m) {
      const name = m[1].toLowerCase();
      if (!BUILTIN_PROVIDERS[name]) names.add(name);
    }
  }

  const result = [];
  for (const name of names) {
    const p = getProvider(name);
    if (p && p.client_id) result.push({ key: name, name: p.name });
  }
  // Sort: built-in providers first, then custom
  const builtinOrder = ['github', 'google', 'gitlab', 'gitee'];
  result.sort((a, b) => {
    const ai = builtinOrder.indexOf(a.key);
    const bi = builtinOrder.indexOf(b.key);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.key.localeCompare(b.key);
  });
  return result;
}

// ── CORS Helper ────────────────────────────────────────────────────

function corsHeaders(origin) {
  const allowed = process.env.SITE_URL || origin || '*';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// ── Main Handler ───────────────────────────────────────────────────

export const handler = async (event) => {
  const headers = corsHeaders(event.headers?.origin);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  const params = event.queryStringParameters || {};
  const action = params.action || '';

  try {
    switch (action) {
      case 'login':
        return handleLogin(event, params, headers);
      case 'callback':
        return await handleCallback(event, params, headers);
      case 'me':
        return await handleMe(event, headers);
      case 'logout':
        return handleLogout(params, headers);
      case 'providers':
        return handleProviders(headers);
      default:
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providers: getConfiguredProviders(),
            authenticated: false,
            endpoints: { login: '?action=login&provider=NAME', me: '?action=me', logout: '?action=logout' },
          }),
        };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// ── Actions ────────────────────────────────────────────────────────

async function handleLogin(event, params, headers) {
  const providerName = (params.provider || '').toLowerCase();
  const provider = getProvider(providerName);
  if (!provider) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Unknown or unconfigured provider: ${providerName}` }),
    };
  }

  // Generate PKCE
  const codeVerifier = randomString(64);
  const state = randomString(32);

  // Build redirect URI for callback
  const siteUrl = process.env.SITE_URL || `https://${event.headers.host}`;
  const redirectUri = `${siteUrl}/.netlify/functions/auth?action=callback`;

  // Build authorize URL
  const authParams = new URLSearchParams({
    client_id: provider.client_id,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
    scope: provider.scope || 'profile',
    code_challenge_method: 'S256',
  });

  const hash = await sha256(codeVerifier);
  authParams.set('code_challenge', base64url(hash));
  const url = `${provider.authorize_url}?${authParams.toString()}`;

  // Store provider:code_verifier:state in a temporary cookie (HttpOnly, 10 min)
  const cookieVal = `${providerName}:${codeVerifier}:${state}`;
  const isLocal = (process.env.SITE_URL || '').includes('localhost');
  const stateCookie = [
    `gb_oauth=${cookieVal}`,
    'HttpOnly',
    'Path=/',
    'Max-Age=600',
    'SameSite=Lax',
    ...(isLocal ? [] : ['Secure']),
  ].join('; ');

  return {
    statusCode: 302,
    headers: {
      ...headers,
      Location: url,
      'Set-Cookie': stateCookie,
    },
  };
}

async function handleCallback(event, params, headers) {
  const code = params.code;
  const state = params.state;

  if (!code) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing authorization code' }),
    };
  }

  // Parse the oauth cookie: format is "provider:code_verifier:state"
  const cookies = parseCookies(event.headers?.cookie || '');
  const oauthCookie = cookies['gb_oauth'] || '';
  const parts = oauthCookie.split(':');
  const providerName = parts[0];
  const codeVerifier = parts[1];
  const expectedState = parts[2];

  if (!providerName || !codeVerifier) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'text/html' },
      body: '<html><body><p>Session expired. Please try logging in again.</p><script>setTimeout(function(){location.href="/guestbook"},2000)</script></body></html>',
    };
  }

  // Validate state to prevent CSRF
  if (state && expectedState && state !== expectedState) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'State mismatch' }),
    };
  }

  const provider = getProvider(providerName);
  if (!provider) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'text/html' },
      body: '<html><body><p>Unknown provider. Please try logging in again.</p><script>setTimeout(function(){location.href="/guestbook"},2000)</script></body></html>',
    };
  }

  // Exchange code for token
  const siteUrl = process.env.SITE_URL || `https://${event.headers.host}`;
  const redirectUri = `${siteUrl}/.netlify/functions/auth?action=callback`;

  const tokenBody = new URLSearchParams({
    client_id: provider.client_id,
    client_secret: provider.client_secret,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    code_verifier: actualVerifier,
  });

  const tokenHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    ...(provider.token_headers || {}),
  };

  const tokenRes = await fetch(provider.token_url, {
    method: 'POST',
    headers: tokenHeaders,
    body: tokenBody.toString(),
  });

  const tokenData = await tokenRes.json().catch(() => ({}));

  if (!tokenData.access_token) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Token exchange failed', details: tokenData }),
    };
  }

  // Fetch user info
  const userHeaders = {
    Authorization: `Bearer ${tokenData.access_token}`,
    ...(provider.userinfo_headers || {}),
  };

  const userRes = await fetch(provider.userinfo_url, { headers: userHeaders });
  const userData = await userRes.json().catch(() => ({}));

  const mappedUser = (provider.map_user || ((d) => ({ uid: d.id, name: d.name, avatar: '' })))(userData);
  const user = {
    provider: providerName,
    ...mappedUser,
  };

  // Create session
  const token = await createSessionToken(user);
  const sessionCookie = getSessionCookie(token, SESSION_MAX_AGE);

  // Clear oauth state cookie
  const clearCookie = `${'gb_oauth'}=; HttpOnly; Path=/; Max-Age=0`;

  // Redirect to guestbook page
  const guestbookUrl = `${siteUrl}/guestbook`;

  return {
    statusCode: 302,
    headers: {
      ...headers,
      Location: guestbookUrl,
      'Set-Cookie': `${sessionCookie}\n${clearCookie}`,
    },
  };
}

async function handleMe(event, headers) {
  const cookies = parseCookies(event.headers?.cookie || '');
  const sessionToken = cookies[SESSION_COOKIE] || '';
  if (!sessionToken) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ authenticated: false }),
    };
  }

  const user = await verifySessionToken(sessionToken);
  if (!user) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ authenticated: false }),
    };
  }

  return {
    statusCode: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ authenticated: true, user }),
  };
}

function handleLogout(params, headers) {
  const redirect = params.redirect || '/guestbook';
  const siteUrl = process.env.SITE_URL || '';
  const clearCookie = `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0`;
  return {
    statusCode: 302,
    headers: {
      ...headers,
      Location: `${siteUrl}${redirect}`,
      'Set-Cookie': clearCookie,
    },
  };
}

function handleProviders(headers) {
  return {
    statusCode: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ providers: getConfiguredProviders() }),
  };
}

// ── Cookie Parser ──────────────────────────────────────────────────

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return out;
}
