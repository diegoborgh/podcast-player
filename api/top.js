module.exports = async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const genre = req.query.genre ? `/genre=${encodeURIComponent(req.query.genre)}` : '';
    const url = `https://itunes.apple.com/us/rss/toppodcasts/limit=${limit}${genre}/json`;
    try {
        const r = await fetch(url);
        if (!r.ok) return res.status(502).json({ error: 'Upstream error', status: r.status });
        const d = await r.json();
        const entries = (d.feed && d.feed.entry) || [];
        const feeds = entries.map((e, i) => {
            const images = e['im:image'] || [];
            const artwork = (images[images.length - 1] || {}).label || '';
            return {
                id: parseInt((e.id && e.id.attributes && e.id.attributes['im:id']) || `${Date.now()}${i}`, 10),
                itunesId: parseInt((e.id && e.id.attributes && e.id.attributes['im:id']) || '0', 10),
                title: (e['im:name'] && e['im:name'].label) || '',
                author: (e['im:artist'] && e['im:artist'].label) || '',
                artwork: artwork.replace(/\/\d+x\d+bb\./, '/600x600bb.'),
                category: (e.category && e.category.attributes && e.category.attributes.label) || '',
                description: (e.summary && e.summary.label) || '',
            };
        });
        res.json({ feeds });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
