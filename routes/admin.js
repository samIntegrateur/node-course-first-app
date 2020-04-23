const express = require('express');
const path = require('path');
const rootDir = require('../util/root');

const router = express.Router();

const products = [];

router.get('/add-product', (req, res) => {
  // nb, it will set text/html header for us
  // res.send('<form action="/admin/add-product" method="post"><input type="text" name="title" /><button type="submit">Add product</button></form>');
  // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
  res.render('add-product', {
    docTitle: 'Add a product',
    path: '/admin/add-product'
  });
});

// same route but POST instead of GET
router.post('/add-product', (req, res) => {
  // would return undefined if we had not bodyParser
  // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11566290#overview
  console.log('body', req.body);
  products.push({ title: req.body.title });
  res.redirect('/');
});

exports.routes = router;
exports.products = products;
