const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
  res.render('admin/add-product', {
    docTitle: 'Add a product',
    path: '/admin/add-product',
  });
};

exports.postAddProduct = (req, res) => {
  // would return undefined if we had not bodyParser
  // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11566290#overview
  console.log('body', req.body);
  const { title, imageUrl, price, description} = req.body;
  const product = new Product(title, imageUrl, description, price);
  product.save();
  res.redirect('/');
};

exports.getProducts = (req, res) => {
  Product.fetchAll((products) => {
    res.render('admin/products', {
      products: products,
      docTitle: 'Admin products',
      path: '/admin/products',
    });
  });
};
