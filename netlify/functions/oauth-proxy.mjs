// Netlify Function: Proxy for GitHub OAuth + API calls
// Avoids CORS issues by routing requests through Netlify's servers.

const GITHUB_OAUTH = 'https://github.com/login';
const GITHUB_API = 'https://api.github.com';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { proxy, url, method, headers, body } = JSON.parse(event.body);

    let targetUrl;
    let reqHeaders = { 'Accept': 'application/json' };
    let reqBody;

    if (proxy === 'oauth') {
      targetUrl = `${GITHUB_OAUTH}/${url}`;
      reqBody = new URLSearchParams(body);
    } else if (proxy === 'api') {
      targetUrl = `${GITHUB_API}${url}`;
      if (headers) Object.assign(reqHeaders, headers);
      reqBody = body ? JSON.stringify(body) : undefined;
      if (body) reqHeaders['Content-Type'] = 'application/json';
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid proxy target' }) };
    }

    const opts = {
      method: method || 'POST',
      headers: reqHeaders,
    };
    if (reqBody) opts.body = reqBody;

    const res = await fetch(targetUrl, opts);
    const text = await res.text();

    // Try to parse as JSON, fall back to text
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    return {
      statusCode: res.status,
      body: JSON.stringify({ data, status: res.status }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
