// Netlify Function: Guestbook API
//
// Comment CRUD backed by GitHub Issues (via bot token).
// User identity comes from OAuth session cookie — any provider works.
//
// GET  /.netlify/functions/guestbook          — list comments
// POST /.netlify/functions/guestbook          — create comment (requires auth)

const OWNER = 'WaterMagent';
const REPO = 'oexa';
const ISSUE_TITLE = '[Guestbook]';
const ISSUE_BODY = '留言板 -- 访客留言。此 Issue 由系统自动管理。';

// ── Helpers ────────────────────────────────────────────────────────

async function ghRequest(endpoint, opts = {}) {
  const token = process.env.GITHUB_BOT_TOKEN;
  if (!token) throw new Error('GITHUB_BOT_TOKEN not configured');

  const url = `https://api.github.com${endpoint}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'guestbook/1.0',
      ...(opts.headers || {}),
    },
    ...(opts.method ? { method: opts.method } : {}),
    ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
  });

  const data = await res.json().catch(() => ({}));
  if (res.status >= 400) {
    throw new Error(data.message || `GitHub API error ${res.status}`);
  }
  return data;
}

// ── Session Verification ───────────────────────────────────────────

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return out;
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/\//g, '_');
  while (str.length % 4) str += '=';
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

function base64url(bytes) {
  const str = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmacSign(payload, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return new Uint8Array(sig);
}

async function verifySession(cookieHeader) {
  const cookies = parseCookies(cookieHeader);
  const token = cookies['gb_session'] || '';
  if (!token) return null;

  try {
    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) return null;

    const secret = process.env.OAUTH_JWT_SECRET || 'dev-secret-change-me-in-production';
    const expectedSig = base64url(await hmacSign(payloadB64, secret));
    if (sigB64 !== expectedSig) return null;

    const payloadStr = new TextDecoder().decode(base64urlDecode(payloadB64));
    const payload = JSON.parse(payloadStr);
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return { provider: payload.provider, uid: payload.uid, name: payload.name, avatar: payload.avatar };
  } catch {
    return null;
  }
}

// ── Issue Management ───────────────────────────────────────────────

let _issueNumber = null;

async function getIssueNumber() {
  if (_issueNumber !== null) return _issueNumber;

  // Search for existing guestbook issue
  const query = encodeURIComponent(`repo:${OWNER}/${REPO} type:issue state:open ${ISSUE_TITLE}`);
  const search = await ghRequest(`/search/issues?q=${query}`);
  if (search.items && search.items.length > 0) {
    _issueNumber = search.items[0].number;
    return _issueNumber;
  }

  // Create it
  const created = await ghRequest(`/repos/${OWNER}/${REPO}/issues`, {
    method: 'POST',
    body: { title: ISSUE_TITLE, body: ISSUE_BODY },
  });
  _issueNumber = created.number;
  return _issueNumber;
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

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await handleList(headers);
      case 'POST':
        return await handleCreate(event, headers);
      default:
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }
  } catch (err) {
    console.error('Guestbook error:', err);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};

async function handleList(headers) {
  const issueNum = await getIssueNumber();
  const comments = await ghRequest(
    `/repos/${OWNER}/${REPO}/issues/${issueNum}/comments?per_page=100&sort=created&direction=desc`
  );

  const messages = (Array.isArray(comments) ? comments : []).map((c) => {
    // Parse the "[Provider:Username]" prefix from body
    let author = { name: c.user.login, provider: 'github', avatar: c.user.avatar_url };
    let body = c.body || '';

    const prefixMatch = body.match(/^\[([a-z]+):([^\]]+)\]\s*/i);
    if (prefixMatch) {
      author = { ...author, provider: prefixMatch[1], name: prefixMatch[2] };
      body = body.slice(prefixMatch[0].length);
    }

    return {
      id: c.id,
      author,
      body,
      created_at: c.created_at,
    };
  });

  return {
    statusCode: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  };
}

async function handleCreate(event, headers) {
  // Verify session
  const user = await verifySession(event.headers?.cookie || '');
  if (!user) {
    return {
      statusCode: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Authentication required' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const message = (body.message || '').trim();
  if (!message || message.length > 500) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Message must be 1-500 characters' }),
    };
  }

  const issueNum = await getIssueNumber();

  // Format: [provider:username] message
  const formattedBody = `[${user.provider}:${user.name}] ${message}`;

  const comment = await ghRequest(`/repos/${OWNER}/${REPO}/issues/${issueNum}/comments`, {
    method: 'POST',
    body: { body: formattedBody },
  });

  return {
    statusCode: 201,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      message: {
        id: comment.id,
        author: { name: user.name, provider: user.provider, avatar: user.avatar },
        body: message,
        created_at: comment.created_at,
      },
    }),
  };
}
