#!/usr/bin/env node
/**
 * Fetch all songs from a Netease playlist and cache the results.
 *
 * Usage: node scripts/fetch-music.mjs [playlistId]
 *   playlistId defaults to 14292629226
 *
 * The script writes to:
 *   public/music-cache.json  — array of song objects
 *   public/music-cover.json  — playlist cover URL
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC = resolve(ROOT, 'public');
const CACHE = resolve(PUBLIC, 'music-cache.json');
const COVER_CACHE = resolve(PUBLIC, 'music-cover.json');

const PLAYLIST_ID = parseInt(process.argv[2], 10) || 14292629226;
const BATCH_SIZE = 100;       // songs per detail request
const BATCH_DELAY = 5000;     // ms between batches
const RATE_LIMIT_WAIT = 45_000; // ms when rate-limited (code 405)
const MAX_RETRIES = 5;

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch playlist metadata + all track IDs.
 * @returns {Promise<{trackIds: number[], totalCount: number, coverUrl: string, name: string, playCount: number}>}
 */
async function fetchPlaylist() {
  const url = `https://music.163.com/api/v3/playlist/detail?id=${PLAYLIST_ID}`;
  const res = await fetch(url, {
    headers: { Referer: 'https://music.163.com/' },
  });
  const data = await res.json();
  const pl = data.playlist;
  if (!pl) throw new Error('Playlist not found in response');

  const trackIds = (pl.trackIds || []).map((t) => t.id);
  return {
    trackIds,
    totalCount: pl.trackCount || trackIds.length,
    coverUrl: (pl.coverImgUrl || '').replace('http://', 'https://'),
    name: pl.name || '音乐推荐',
    playCount: pl.playCount || 0,
  };
}

/**
 * Fetch details for a batch of song IDs.
 * Returns the songs array, or null if rate-limited (should retry).
 * @param {number[]} ids
 * @returns {Promise<object[]|null>}
 */
async function fetchSongBatch(ids) {
  const encoded = '%5B' + ids.join(',') + '%5D'; // [id1,id2,...]
  const url = `https://music.163.com/api/song/detail?ids=${encoded}`;
  const res = await fetch(url, {
    headers: { Referer: 'https://music.163.com/' },
  });
  const data = await res.json();

  // code 405 = rate limited
  if (data.code === 405) return null;

  if (!data.songs || data.songs.length === 0) return [];

  return data.songs.map((s) => ({
    id: s.id,
    name: s.name,
    artists: (s.artists || []).map((a) => a.name).join(', '),
    album: s.album?.name || '',
    cover: (s.album?.picUrl || '').replace('http://', 'https://'),
    duration: s.duration || 0,
  }));
}

/**
 * Load existing cache if present.
 * @returns {{songs: object[], cover: object}|null}
 */
function loadCache() {
  try {
    if (existsSync(CACHE)) {
      const raw = JSON.parse(readFileSync(CACHE, 'utf-8'));
      if (Array.isArray(raw) && raw.length > 0) {
        const cover = existsSync(COVER_CACHE)
          ? JSON.parse(readFileSync(COVER_CACHE, 'utf-8'))
          : {};
        return { songs: raw, cover };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Save songs array to cache.
 * @param {object[]} songs
 */
function saveCache(songs, cover) {
  if (!existsSync(PUBLIC)) mkdirSync(PUBLIC, { recursive: true });
  writeFileSync(CACHE, JSON.stringify(songs), 'utf-8');
  if (cover) writeFileSync(COVER_CACHE, JSON.stringify(cover), 'utf-8');
}

// ── Main ──────────────────────────────────────────────────────────

console.log(`🎵 Fetching playlist #${PLAYLIST_ID} …`);
const { trackIds, totalCount, coverUrl, name, playCount } = await fetchPlaylist();
console.log(`   Playlist: ${name}  |  ${totalCount} tracks  |  ${playCount} plays`);

// Load existing cache
const existing = loadCache();
const seenIds = new Set(existing ? existing.songs.map((s) => s.id) : []);
const allSongs = existing ? [...existing.songs] : [];

console.log(`   Cache: ${allSongs.length} songs  |  Missing: ${totalCount - allSongs.length}`);

// Build list of IDs we still need
const missingIds = trackIds.filter((id) => !seenIds.has(id));
if (missingIds.length === 0) {
  console.log('✅ Cache is already complete!');
  process.exit(0);
}

// Save cover info
const cover = { cover: coverUrl, name, playCount, totalCount };

// Fetch missing in batches
let fetched = 0;
const totalBatches = Math.ceil(missingIds.length / BATCH_SIZE);
for (let i = 0; i < missingIds.length; i += BATCH_SIZE) {
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;
  const batch = missingIds.slice(i, i + BATCH_SIZE);

  let success = false;
  for (let retry = 0; retry < MAX_RETRIES && !success; retry++) {
    const songs = await fetchSongBatch(batch);

    if (songs === null) {
      // Rate limited — long wait
      const wait = RATE_LIMIT_WAIT + Math.floor(Math.random() * 15_000);
      console.log(`   ⚠️  Rate limited (batch ${batchNum}/${totalBatches}), waiting ${Math.round(wait / 1000)}s … (retry ${retry + 1}/${MAX_RETRIES})`);
      await sleep(wait);
      continue;
    }

    if (songs.length === 0) {
      // Empty response — wait and retry
      console.log(`   ⚠️  Empty response (batch ${batchNum}/${totalBatches}), retrying in 10s … (retry ${retry + 1}/${MAX_RETRIES})`);
      await sleep(10_000);
      continue;
    }

    // Success
    for (const s of songs) {
      if (!seenIds.has(s.id)) {
        seenIds.add(s.id);
        allSongs.push(s);
      }
    }
    fetched += songs.length;
    success = true;
  }

  if (!success) {
    console.log(`   ❌ Batch ${batchNum}/${totalBatches} failed after ${MAX_RETRIES} retries.`);
  }

  // Save progress after each batch
  saveCache(allSongs, cover);
  console.log(`   📦 Batch ${batchNum}/${totalBatches} done  |  Cache: ${allSongs.length}/${totalCount}  |  +${fetched} new`);

  // Delay between batches (skip after last)
  if (i + BATCH_SIZE < missingIds.length) {
    const delay = BATCH_DELAY + Math.floor(Math.random() * 3000);
    await sleep(delay);
  }
}

// Final save
saveCache(allSongs, cover);
console.log(`\n✅ Done! ${allSongs.length}/${totalCount} songs cached.`);
if (allSongs.length < totalCount) {
  console.log(`   ⚠️  Missing ${totalCount - allSongs.length} songs — re-run the script to retry.`);
  process.exit(1);
}
