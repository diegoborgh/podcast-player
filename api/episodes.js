const { proxyToPodcastIndex } = require('../lib/podcastIndex');

module.exports = async (req, res) => {
    const { feedId, max } = req.query;
    if (!feedId) {
        return res.status(400).json({ error: 'Feed ID parameter is required' });
    }
    return proxyToPodcastIndex(
        `/episodes/byitunesid?id=${encodeURIComponent(feedId)}&max=${max}`,
        res
    );
};
