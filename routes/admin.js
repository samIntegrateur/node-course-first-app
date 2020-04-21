const express = require('express');
const path = require('path');
const rootDir = require('../util/root');

const router = express.Router();

router.get('/add-product', (req, res) => {
  // nb, it will set text/html header for us
  // res.send('<form action="/admin/add-product" method="post"><input type="text" name="title" /><button type="submit">Add product</button></form>');
  res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
});

// same route but POST instead of GET
router.post('/add-product', (req, res) => {
  // would return undefined if we had not bodyParser
  // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11566290#overview
  console.log('body', req.body);
  res.redirect('/');
});

module.exports = router;
