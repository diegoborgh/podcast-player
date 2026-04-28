const CryptoJS = require('crypto-js');

const apiEndpoint = process.env.API_ENDPOINT;

function generateAuthHeaders() {
    const apiHeaderTime = Math.floor(Date.now() / 1000);
    const hash = CryptoJS.SHA1(
        process.env.AUTH_KEY + process.env.SECRET_KEY + apiHeaderTime
    ).toString(CryptoJS.enc.Hex);

    return {
        'User-Agent': process.env.USER_AGENT,
        'X-Auth-Key': process.env.AUTH_KEY,
        'X-Auth-Date': apiHeaderTime.toString(),
        'Authorization': hash,
    };
}

async function proxyToPodcastIndex(path, res) {
    try {
        const response = await fetch(`${apiEndpoint}${path}`, {
            method: 'GET',
            headers: generateAuthHeaders(),
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
            const data = await response.json();
            return res.json(data);
        }

        const rawText = await response.text();
        console.log('Raw response:', rawText);
        return res.status(500).json({ error: 'Invalid response from API', rawText });
    } catch (error) {
        console.error('Error fetching API:', error.message);
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { generateAuthHeaders, apiEndpoint, proxyToPodcastIndex };
