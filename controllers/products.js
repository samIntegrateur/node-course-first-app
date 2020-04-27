const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
  res.render('add-product', {
    docTitle: 'Add a product',
    path: '/admin/add-product',
    activeAddProduct: true,
  });
};

exports.postAddProduct = (req, res) => {
  // would return undefined if we had not bodyParser
  // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11566290#overview
  console.log('body', req.body);
  const product = new Product(req.body.title);
  product.save();
  res.redirect('/');
};

exports.getProducts = (req, res) => {
  Product.fetchAll((products) => {
    res.render('shop', {
      products: products,
      docTitle: 'My awesome patisserie',
      path: '/',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true,
    });
  });
};
