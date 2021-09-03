const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('<h1>HTTP server is up and running</h1>')
})

module.exports = router;