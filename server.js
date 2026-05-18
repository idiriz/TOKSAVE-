// TokSave Backend — server.js
// Uses TikWM free API (no API key needed)
// Install: npm install express axios cors dotenv express-rate-limit

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const axios      = require('axios');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve your HTML frontend from same server (optional)
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting: max 30 requests per 15 min per IP
const limiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  max      : 30,
  message  : { success: false, error: 'Too many requests. Please wait and try again.' }
});
app.use('/api/', limiter);

// ─── DOWNLOAD HISTORY (in-memory, replace with DB in production) ──
const history = [];

// ─── HELPER: Validate TikTok URL ─────────────────────────
function isValidTikTokUrl(url) {
  return /tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com/.test(url);
}

// ─── MAIN DOWNLOAD ENDPOINT ──────────────────────────────
// POST /api/download
// Body: { "url": "https://www.tiktok.com/@user/video/..." }
// Returns: { success, hd, sd, nowatermark, audio, title, thumbnail, author }

app.post('/api/download', async (req, res) => {
  const { url } = req.body;

  // 1. Validate input
  if (!url || !isValidTikTokUrl(url)) {
    return res.status(400).json({ success: false, error: 'Invalid TikTok URL.' });
  }

  try {
    // 2. Call TikWM free API — no API key required
    const response = await axios.post(
      'https://www.tikwm.com/api/',
      new URLSearchParams({ url, hd: '1' }),   // hd=1 requests HD version
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      }
    );

    const d = response.data;

    // 3. Check TikWM response
    if (!d || d.code !== 0 || !d.data) {
      return res.status(502).json({ success: false, error: 'Could not fetch video. The link may be private or unavailable.' });
    }

    const video = d.data;

    // 4. Save to history
    history.unshift({ url, title: video.title, time: new Date().toISOString() });
    if (history.length > 100) history.pop(); // keep last 100

    // 5. Return clean response to frontend
    return res.json({
      success     : true,
      title       : video.title       || 'TikTok Video',
      author      : video.author?.nickname || '',
      thumbnail   : video.cover        || '',
      duration    : video.duration     || 0,
      // Download URLs
      hd          : video.hdplay       || video.play || '',   // HD (1080p when available)
      sd          : video.play         || '',                  // SD (standard)
      nowatermark : video.hdplay       || video.play || '',   // TikWM already strips watermark
      audio       : video.music        || '',                  // MP3 audio
    });

  } catch (err) {
    console.error('TikWM API error:', err.message);
    return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

// ─── HISTORY ENDPOINT ────────────────────────────────────
// GET /api/history
app.get('/api/history', (req, res) => {
  res.json({ success: true, history: history.slice(0, 20) });
});

// ─── START ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ TokSave server running on http://localhost:${PORT}`);
});
