// Netlify Function: Guestbook API
//
// Comment CRUD backed by GitHub Issues (bot token).
// Uses Node.js crypto for JWT verification.
//
// GET  /.netlify/functions/guestbook  — list comments
// POST /.netlify/functions/guestbook  — create comment

import { createHmac } from 'node:crypto';

const OWNER = 'WaterMagent';
const REPO = 'oexa';
const ISSUE_TITLE = '[Guestbook]';

// ── Crypto ─────────────────────────────────────────────────────────

function base64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function base64urlDecode(str) {
  return Buffer.from(str, 'base64url');
}

function hmacSign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest();
}

// ── Session ────────────────────────────────────────────────────────

async function verifyToken(token) {
  if (!token) return null;
  try {
    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) return null;
    const secret = process.env.OAUTH_JWT_SECRET || 'dev-secret-change-me-in-production';
    const expectedSig = base64url(hmacSign(payloadB64, secret));
    if (sigB64 !== expectedSig) return null;
    const payload = JSON.parse(base64urlDecode(payloadB64).toString('utf-8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { provider: payload.provider, uid: payload.uid, name: payload.name, avatar: payload.avatar };
  } catch { return null; }
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

async function getSessionUser(event) {
  // Try cookie
  const cookies = parseCookies(event.headers?.cookie || '');
  let token = cookies['gb_session'] || cookies['gb_token'] || '';
  // Try Authorization header
  if (!token) {
    const m = (event.headers?.authorization || '').match(/^Bearer\s+(.+)$/i);
    if (m) token = m[1];
  }
  return verifyToken(token);
}

// ── GitHub API ─────────────────────────────────────────────────────

async function ghRequest(endpoint, opts = {}) {
  const token = process.env.GITHUB_BOT_TOKEN;
  if (!token) throw new Error('GITHUB_BOT_TOKEN not configured');

  const res = await fetch(`https://api.github.com${endpoint}`, {
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
  if (res.status >= 400) throw new Error(data.message || `GitHub API error ${res.status}`);
  return data;
}

let _issueNum = null;

async function getIssueNumber() {
  if (_issueNum !== null) return _issueNum;
  const q = encodeURIComponent(`repo:${OWNER}/${REPO} type:issue state:open ${ISSUE_TITLE}`);
  const search = await ghRequest(`/search/issues?q=${q}`);
  if (search.items?.length > 0) {
    _issueNum = search.items[0].number;
    return _issueNum;
  }
  const created = await ghRequest(`/repos/${OWNER}/${REPO}/issues`, {
    method: 'POST',
    body: { title: ISSUE_TITLE, body: 'Guestbook messages. Auto-managed.' },
  });
  _issueNum = created.number;
  return _issueNum;
}

// ── CORS ───────────────────────────────────────────────────────────

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': process.env.SITE_URL || origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// ── Main ───────────────────────────────────────────────────────────

export const handler = async (event) => {
  const h = corsHeaders(event.headers?.origin);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: h };

  try {
    if (event.httpMethod === 'GET') return await handleList(h);
    if (event.httpMethod === 'POST') return await handleCreate(event, h);
    return { statusCode: 405, headers: h, body: 'Method Not Allowed' };
  } catch (err) {
    return { statusCode: 500, headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.message }) };
  }
};

async function handleList(headers) {
  const issueNum = await getIssueNumber();
  const comments = await ghRequest(`/repos/${OWNER}/${REPO}/issues/${issueNum}/comments?per_page=100&sort=created&direction=desc`);

  const messages = (Array.isArray(comments) ? comments : []).map((c) => {
    let author = { name: c.user.login, provider: 'github', avatar: '' };
    let body = c.body || '';
    // Format: [provider|username|avatar_b64] message
    const m = body.match(/^\[([a-z]+)\|([^|]+)\|([^\]]+)\]\s*/i);
    if (m) {
      author = { name: m[2], provider: m[1], avatar: Buffer.from(m[3], 'base64url').toString('utf-8') };
      body = body.slice(m[0].length);
    }
    return { id: c.id, author, body, created_at: c.created_at };
  });

  return { statusCode: 200, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) };
}

async function handleCreate(event, headers) {
  const user = await getSessionUser(event);
  if (!user) {
    return { statusCode: 401, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Authentication required' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch {
    return { statusCode: 400, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const message = (body.message || '').trim();
  if (!message || message.length > 500) {
    return { statusCode: 400, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Message must be 1-500 chars' }) };
  }

  const issueNum = await getIssueNumber();
  const avatarB64 = Buffer.from(user.avatar || '').toString('base64url');
  const formatted = `[${user.provider}|${user.name}|${avatarB64}] ${message}`;
  const comment = await ghRequest(`/repos/${OWNER}/${REPO}/issues/${issueNum}/comments`, {
    method: 'POST',
    body: { body: formatted },
  });

  return {
    statusCode: 201,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      message: { id: comment.id, author: { name: user.name, provider: user.provider, avatar: user.avatar }, body: message, created_at: comment.created_at },
    }),
  };
}
