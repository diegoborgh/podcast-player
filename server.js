const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/search', require('./api/search'));
app.get('/api/episodes', require('./api/episodes'));
app.get('/api/trending', require('./api/trending'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
