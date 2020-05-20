const { validationResult } = require('express-validator');

const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    docTitle: 'Add a product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res) => {
  const { title, imageUrl, price, description } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(' errors.array()', errors.array());
    return res.status(422).render('admin/edit-product', {
      docTitle: 'Add product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: { title, imageUrl, price, description },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

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
        hasError: false,
        product: product,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch(err => console.log('err', err));
};

exports.postEditProduct = (req, res) => {
  console.log('body', req.body);
  const { id, title, imageUrl, price, description} = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(' errors.array()', errors.array());
    return res.status(422).render('admin/edit-product', {
      docTitle: 'Add product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: { _id: id, title, imageUrl, price, description },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(id)
    .then(product => {

      // Check if it's our product
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }

      product.title = title;
      product.imageUrl = imageUrl;
      product.price = price;
      product.description = description;
      return product.save()
        .then(result => {
          console.log('UPDATED PRODUCT');
          res.redirect('/admin/products');
        })
    })
    .catch(err => console.log('err', err));
};

exports.getProducts = (req, res) => {
  Product.find({userId: req.user._id}) // only products created by user
    // .select('title price -_id') // select/unselect fields
    // .populate('userId') // populate ref, not just id (don't know why it didn't work here)
    .then(products => {
      // console.log('products', products);
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
  Product.deleteOne({_id: productId, userId: req.user._id})
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => console.log('err', err));
};
