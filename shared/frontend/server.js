const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 0,
  etag: false
}));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(4200, () => {
  console.log('Angular app listening on http://0.0.0.0:4200');
});
