const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res) => {
  Product.find()
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
  Product.find()
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
    .then(product => {
      res.render('shop/product-detail', {
        docTitle: product.title,
        path: '/products',
        product: product,
      });
  }).catch(err => console.log(err, err));

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
    .catch(err => console.log('err', err));
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
    .catch(err => console.log('err', err));
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
  Order.find({'user.userId': req.user._id})
    .then(orders => {
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
          name: req.user.name,
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
    .catch(err => console.log('err', err));

};
