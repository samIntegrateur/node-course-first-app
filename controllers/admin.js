const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    docTitle: 'Add a product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.user,
  });
};

exports.postAddProduct = (req, res) => {
  const { title, imageUrl, price, description} = req.body;

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user, // mongoose will just pick up the id, because of our Product model
  });

  product
    .save()
    .then(result => {
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

  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        docTitle: 'Edit product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        isAuthenticated: req.user,
      });
    })
    .catch(err => console.log('err', err));
};

exports.postEditProduct = (req, res) => {
  console.log('body', req.body);
  const { id, title, imageUrl, price, description} = req.body;

  Product.findById(id)
    .then(product => {
      product.title = title;
      product.imageUrl = imageUrl;
      product.price = price;
      product.description = description;
      return product.save()
    })
    .then(result => {
      console.log('UPDATED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => console.log('err', err));
};

exports.getProducts = (req, res) => {
  Product.find()
    // .select('title price -_id') // select/unselect fields
    // .populate('userId') // populate ref, not just id (don't know why it didn't work here)
    .then(products => {
      // console.log('products', products);
      res.render('admin/products', {
        products: products,
        docTitle: 'Admin products',
        path: '/admin/products',
        isAuthenticated: req.user,
      });
    })
    .catch(err => console.log('err', err));
};


exports.postDeleteProduct = (req, res) => {
  const productId = req.body.productId;
  Product.findByIdAndRemove(productId)
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => console.log('err', err));
};
