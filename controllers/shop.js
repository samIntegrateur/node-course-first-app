const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        products: products,
        docTitle: 'Drômadélice',
        path: '/',
      });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        products: products,
        docTitle: 'Products ',
        path: '/products',
      });
    }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        docTitle: product.title,
        path: '/products',
        product: product,
      });
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });

};

exports.getCart = (req, res) => {
  req.user
    .populate('cart.items.productId') // get the full product ref (productId will be the object instead of id)
    .execPopulate()
    .then(user => {
      res.render('shop/cart', {
        docTitle: 'My cart',
        path: '/cart',
        products: user.cart.items,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      // req.user is an instance of User
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log('ADDED TO CART');
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
    .then(result => {
      console.log('PRODUCT REMOVED FROM CART');
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id})
    .then(orders => {
      res.render('shop/orders', {
        docTitle: 'My orders',
        path: '/orders',
        orders: orders,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res) => {
  res.render('shop/checkout', {
    docTitle: 'Checkout',
    path: '/checkout',
  });
};

// Create order from cart, then delete cart items
exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId') // get the full product ref (productId will be the object instead of id)
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(product => {
        return {
          // We need that to store the whole doc datas, not just the ObjectId
          // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11954190#overview
          product: { ...product.productId._doc },
          quantity: product.quantity,
        };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(result => {
      console.log('CREATED ORDER AND CLEANED CART');
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

};
