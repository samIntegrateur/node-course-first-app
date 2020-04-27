const Product = require('../models/product');

exports.getIndex = (req, res) => {
  Product.fetchAll((products) => {
    res.render('shop/index', {
      products: products,
      docTitle: 'My awesome patisserie',
      path: '/',
    });
  });
}

exports.getProducts = (req, res) => {
  Product.fetchAll((products) => {
    res.render('shop/product-list', {
      products: products,
      docTitle: 'Products ',
      path: '/products',
    });
  });
};

exports.getCart = (req, res) => {
  res.render('shop/cart', {
    docTitle: 'My cart',
    path: '/cart',
  });
};

exports.getOrders = (req, res) => {
  res.render('shop/orders', {
    docTitle: 'My orders',
    path: '/orders',
  });
};

exports.getCheckout = (req, res) => {
  res.render('shop/checkout', {
    docTitle: 'Checkout',
    path: '/checkout',
  });
};


