const { proxyToPodcastIndex } = require('../lib/podcastIndex');

module.exports = async (req, res) => {
    const max = req.query.max || 50;
    const cat = req.query.cat ? `&cat=${encodeURIComponent(req.query.cat)}` : '';
    return proxyToPodcastIndex(`/podcasts/trending?max=${max}&lang=en${cat}`, res);
};
