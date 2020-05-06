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

  // create a new associated object
  // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11739036#overview
  // Based on the relationship we defined, sequelize creates a method that handles it
  // It will automatically provide the userId field for the new product
  req.user.createProduct({
    title,
    price,
    imageUrl,
    description,
  }).then(result => {
    console.log('Created product');
    res.redirect('/admin/products');
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

  // Product.findByPk(prodId)
  // getProducts : Method created by sequelize, we ensure that product requested is this user's one
  req.user
    .getProducts({where: {id: prodId}})
    .then(products => {
      const product = products[0];
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        docTitle: 'Edit product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
      });
    })
    .catch(err => console.log('err', err));
};

exports.postEditProduct = (req, res) => {
  console.log('body', req.body);
  const { id, title, imageUrl, price, description} = req.body;

  Product.findByPk(id)
    .then(product => {
      product.title = title;
      product.imageUrl = imageUrl;
      product.price = price;
      product.description = description;
      return product.save();
    })
    .then(result => {
      console.log('UPDATED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => console.log('err', err));
};

exports.getProducts = (req, res) => {
  // Product.findAll()
  req.user
    .getProducts()
    .then(products => {
      res.render('admin/products', {
        products: products,
        docTitle: 'Admin products',
        path: '/admin/products',
      });
    })
    .catch(err => console.log('err', err));
};


exports.postDeleteProduct = (req, res) => {
  const productId = req.body.productId;
  Product.findByPk(productId)
    .then(product => {
      return product.destroy();
    })
    .then(result => {
      console.log('DESTROY PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => console.log('err', err));
};
