require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');
const { URL } = require('url');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// ✅ URL Shortener Logic
let urlDatabase = {};
let counter = 1;

app.post('/api/shorturl', function (req, res) {
  const submittedUrl = req.body.url;

  let urlObj;
  try {
    urlObj = new URL(submittedUrl);
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(urlObj.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      const short = counter++;
      urlDatabase[short] = submittedUrl;

      res.json({
        original_url: submittedUrl,
        short_url: short
      });
    }
  });
});

app.get('/api/shorturl/:short', function (req, res) {
  const short = req.params.short;
  const originalUrl = urlDatabase[short];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
