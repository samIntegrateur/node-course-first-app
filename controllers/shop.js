const Product = require('../models/product');

exports.getIndex = (req, res) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/index', {
        products: products,
        docTitle: 'Drômadélice',
        path: '/',
      });
  })
  .catch(err => console.log('err', err));
}

exports.getProducts = (req, res) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/product-list', {
        products: products,
        docTitle: 'Products ',
        path: '/products',
      });
    }).catch(err => console.log('err', err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        docTitle: product.title,
        path: '/products',
        product: product,
      });
  }).catch(err => console.log(err, err));

};

exports.getCart = (req, res) => {
  req.user
    .getCart()
    .then(products => {
      res.render('shop/cart', {
        docTitle: 'My cart',
        path: '/cart',
        products: products,
      });
    })
    .catch(err => console.log('err', err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      // req.user is an instance of User
      req.user.addToCart(product);
      res.redirect('/cart');
    }).catch(err => console.log('err', err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
    .then(result => {
      console.log('PRODUCT REMOVED FROM CART');
      res.redirect('/cart');
    })
    .catch(err => console.log('err', err));
};

exports.getOrders = (req, res) => {
  req.user
    .getOrders()
    .then(orders => {
      console.log('orders', orders);
      res.render('shop/orders', {
        docTitle: 'My orders',
        path: '/orders',
        orders: orders,
      });
    })
    .catch(err => console.log('err', err));
};

exports.getCheckout = (req, res) => {
  res.render('shop/checkout', {
    docTitle: 'Checkout',
    path: '/checkout',
  });
};

// Create order from cart, then delete cart items
exports.postOrder = (req, res, next) => {
  let fetchedCart;

  req.user
    .addOrder()
      .then(result => {
        console.log('CREATED ORDER AND REMOVED CART ITEMS');
        res.redirect('/orders');
      })
      .catch(err => console.log('err', err));
};
