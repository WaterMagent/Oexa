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
const DEFAULT_ISSUE = '[Guestbook]';

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
    const secret = process.env.OAUTH_JWT_SECRET;
    if (!secret) throw new Error('OAUTH_JWT_SECRET not configured');
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

const _issueCache = new Map();

async function getIssueNumber(title) {
  if (_issueCache.has(title)) return _issueCache.get(title);
  const q = encodeURIComponent(`repo:${OWNER}/${REPO} type:issue state:open ${title}`);
  const search = await ghRequest(`/search/issues?q=${q}`);
  let num;
  if (search.items?.length > 0) {
    num = search.items[0].number;
  } else {
    const created = await ghRequest(`/repos/${OWNER}/${REPO}/issues`, {
      method: 'POST',
      body: { title, body: 'Comments. Auto-managed.' },
    });
    num = created.number;
  }
  _issueCache.set(title, num);
  return num;
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
    if (event.httpMethod === 'GET') return await handleList(event, h);
    if (event.httpMethod === 'POST') return await handleCreate(event, h);
    if (event.httpMethod === 'DELETE') return await handleDelete(event, h);
    return { statusCode: 405, headers: h, body: 'Method Not Allowed' };
  } catch (err) {
    return { statusCode: 500, headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.message }) };
  }
};

function getIssueTitle(event) {
  const params = event.queryStringParameters || {};
  return (params.issue || DEFAULT_ISSUE).trim();
}

async function handleList(event, headers) {
  const params = event.queryStringParameters || {};
  const page = Math.max(1, parseInt(params.page, 10) || 1);
  const perPage = Math.min(100, Math.max(10, parseInt(params.per_page, 10) || 100));

  const issueNum = await getIssueNumber(getIssueTitle(event));
  const comments = await ghRequest(
    `/repos/${OWNER}/${REPO}/issues/${issueNum}/comments?per_page=${perPage}&page=${page}&sort=created&direction=asc`
  );

  const messages = (Array.isArray(comments) ? comments : []).map((c) => parseComment(c));
  const hasMore = messages.length >= perPage;

  return {
    statusCode: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, page, hasMore }),
  };
}

function parseComment(c) {
  let author = { name: c.user.login, provider: 'github', avatar: '' };
  let body = c.body || '';
  let parentId = '0';

  // Format: [provider|username|avatar|parent_id]
  //   or: [provider|username|avatar]
  //   or: [provider:username]
  const mFull = body.match(/^\[([a-z]+)\|([^|]+)\|([^|]*)\|([^\]]*)\]\s*/i);
  const m3 = body.match(/^\[([a-z]+)\|([^|]+)\|([^\]]*)\]\s*/i);
  const mOld = body.match(/^\[([a-z]+):([^\]]+)\]\s*/i);

  if (mFull) {
    author = { name: mFull[2], provider: mFull[1], avatar: mFull[3] ? safeB64Decode(mFull[3]) : '' };
    parentId = mFull[4] || '0';
    body = body.slice(mFull[0].length);
  } else if (m3) {
    author = { name: m3[2], provider: m3[1], avatar: m3[3] ? safeB64Decode(m3[3]) : '' };
    body = body.slice(m3[0].length);
  } else if (mOld) {
    author = { name: mOld[2], provider: mOld[1], avatar: '' };
    body = body.slice(mOld[0].length);
  }

  return { id: String(c.id), author, body, parentId, created_at: c.created_at };
}

function safeB64Decode(s) {
  try { return Buffer.from(s, 'base64url').toString('utf-8'); } catch { return ''; }
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
  if (!message || message.length > 2000) {
    return { statusCode: 400, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Message must be 1-2000 chars' }) };
  }

  const parentId = body.parent_id || '0';

  const issueNum = await getIssueNumber(getIssueTitle(event));
  const avatarB64 = user.avatar ? Buffer.from(user.avatar).toString('base64url') : '';
  const formatted = `[${user.provider}|${user.name}|${avatarB64}|${parentId}] ${message}`;
  const comment = await ghRequest(`/repos/${OWNER}/${REPO}/issues/${issueNum}/comments`, {
    method: 'POST',
    body: { body: formatted },
  });

  return {
    statusCode: 201,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      message: { id: String(comment.id), author: { name: user.name, provider: user.provider, avatar: user.avatar }, body: message, parentId, replies: [], created_at: comment.created_at },
    }),
  };
}

async function handleDelete(event, headers) {
  const user = await getSessionUser(event);
  if (!user) {
    return { statusCode: 401, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Authentication required' }) };
  }

  const params = event.queryStringParameters || {};
  const ids = params.ids || params.id || '';
  const idList = ids.split(',').map((s) => s.trim()).filter(Boolean);

  if (!idList.length) {
    return { statusCode: 400, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing comment id(s)' }) };
  }

  const issueNum = await getIssueNumber(getIssueTitle(event));
  const adminUid = process.env.ADMIN_GITHUB_UID || '';
  const isAdmin = adminUid && user.provider === 'github' && user.uid === adminUid;
  const deleted = [];
  const errors = [];

  for (const commentId of idList) {
    try {
      // Fetch the comment to check author
      const comment = await ghRequest(`/repos/${OWNER}/${REPO}/issues/comments/${commentId}`);
      const parsed = parseComment(comment);
      const isAuthor = parsed.author.name === user.name && parsed.author.provider === user.provider;

      if (!isAdmin && !isAuthor) {
        errors.push({ id: commentId, error: 'Not authorized' });
        continue;
      }

      await ghRequest(`/repos/${OWNER}/${REPO}/issues/comments/${commentId}`, { method: 'DELETE' });
      deleted.push(commentId);
    } catch (err) {
      errors.push({ id: commentId, error: err.message });
    }
  }

  return {
    statusCode: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, deleted, errors }),
  };
}
