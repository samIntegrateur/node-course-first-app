const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    docTitle: 'Add a product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.postAddProduct = (req, res) => {
  // would return undefined if we had not bodyParser
  // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11566290#overview
  console.log('body', req.body);
  const { title, imageUrl, price, description} = req.body;
  const product = new Product(null, title, imageUrl, description, price);
  product.save()
    .then(() => {
      res.redirect('/');
    })
    .catch(err => console.log('err', err));
};

// We use the same view that addProduct
// but we get the id with a param, and un query param edit confirmation
// It's just for testing query params, the id is sufficient
exports.getEditProduct = (req, res) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId, product => {
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      docTitle: 'Edit product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
    });
  });
};

exports.postEditProduct = (req, res) => {
  console.log('body', req.body);
  const { id, title, imageUrl, price, description} = req.body;
  const product = new Product(id, title, imageUrl, description, price);
  product.save()
    .then(() => {
      res.redirect('/');
    })
    .catch(err => console.log('err', err));
};

exports.getProducts = (req, res) => {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render('admin/products', {
        products: rows,
        docTitle: 'Admin products',
        path: '/admin/products',
      });
    })
    .catch(err => console.log('err', err));
};


exports.postDeleteProduct = (req, res) => {
  const productId = req.body.productId;
  Product.deleteById(productId);
  res.redirect('/admin/products');
};
