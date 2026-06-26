import { writeFileSync } from 'node:fs';

const playlistId = 14292629226;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url, options);
      const d = await r.json();
      if (d.code === 200) return d;
      if (d.code === 405 && i < retries - 1) {
        await sleep(1000 * (i + 1));
        continue;
      }
      return d;
    } catch {
      if (i < retries - 1) await sleep(1000 * (i + 1));
    }
  }
  return { code: 405, songs: null };
}

async function main() {
  console.log('Fetching playlist...');
  const res = await fetch(`https://music.163.com/api/v3/playlist/detail?id=${playlistId}`, {
    headers: { 'Referer': 'https://music.163.com/' }
  });
  const data = await res.json();
  const playlist = data.playlist;
  if (!playlist) {
    console.error('Failed to fetch playlist');
    process.exit(1);
  }

  const trackIds = playlist.trackIds.map(t => t.id);
  const coverUrl = (playlist.coverImgUrl || '').replace('http://', 'https://');
  const allSongs = [];
  const BATCH_SIZE = 2;
  let rateLimited = 0;

  for (let i = 0; i < trackIds.length; i += BATCH_SIZE) {
    const batch = trackIds.slice(i, i + BATCH_SIZE);
    const url = 'https://interface.music.163.com/api/song/detail?ids=%5B' + batch.join(',') + '%5D';

    const d = await fetchWithRetry(url, {
      headers: { 'Referer': 'https://music.163.com/' }
    });

    if (d.songs) {
      for (const s of d.songs) {
        allSongs.push({
          id: s.id, name: s.name,
          artists: (s.artists || []).map(a => a.name).join(', '),
          album: s.album?.name || '',
          cover: (s.album?.picUrl || '').replace('http://', 'https://'),
          duration: s.duration || 0,
        });
      }
      rateLimited = 0;
      process.stdout.write('.');
    } else if (d.code === 405) {
      rateLimited++;
      process.stdout.write('x');
      // exponential backoff
      await sleep(Math.min(5000 * rateLimited, 30000));
    }

    if (i % 50 === 0 && i > 0) {
      console.log(`\n${i}/${trackIds.length} songs, got ${allSongs.length} so far`);
    }
  }

  console.log(`\nDone! Got ${allSongs.length}/${trackIds.length} songs`);

  if (allSongs.length > 0) {
    writeFileSync('public/music-cache.json', JSON.stringify(allSongs), 'utf-8');
    writeFileSync('public/music-cover.json', JSON.stringify({ cover: coverUrl }), 'utf-8');
    console.log('Cache files written to public/');
  }
}

main().catch(console.error);
