const { proxyToPodcastIndex } = require('../lib/podcastIndex');

module.exports = async (req, res) => {
    const max = req.query.max || 50;
    return proxyToPodcastIndex(`/podcasts/trending?max=${max}&lang=en`, res);
};
