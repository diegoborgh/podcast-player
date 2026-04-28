const { proxyToPodcastIndex } = require('../lib/podcastIndex');

module.exports = async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }
    return proxyToPodcastIndex(
        `/search/byterm?q=${encodeURIComponent(query)}&lang=en&max=20`,
        res
    );
};
