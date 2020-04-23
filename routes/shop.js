const express = require('express');
const path = require('path');
const rootDir = require('../util/root');

const adminData = require('./admin');

const router = express.Router();

// get requires an exact path (with use, order would matter, it should be last route)
router.get('/', (req, res) => {
  // the data is shared across requests and users, not safe
  // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11577382#overview
  // console.log('adminData', adminData.products);

  // __dirname : global var which holds the absolute os path to the current folder
  // path.join avoid us to handle / (\ for windows)
  //res.sendFile(path.join(rootDir, 'views', 'shop.html'));

  const products = adminData.products;
  // As we have defined a template engine and a views folder in app.js, it will compile shop.pug
  res.render('shop', {
    products: products,
    docTitle: 'My awesome patisserie',
    path: '/',
  });
});

module.exports = router;
