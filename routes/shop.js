const express = require('express');
const path = require('path');
const rootDir = require('../util/root');

const router = express.Router();

// get requires an exact path (with use, order would matter, it should be last route)
router.get('/', (req, res) => {
  // __dirname : global var which holds the absolute os path to the current folder
  // path.join avoid us to handle / (\ for windows)
  res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

module.exports = router;
