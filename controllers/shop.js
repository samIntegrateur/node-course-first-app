const Product = require('../models/product');

exports.getIndex = (req, res) => {
  Product.findAll()
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
  Product.findAll()
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

  // alternative
  // Product.findAll({where: {id: prodId}})

  Product.findByPk(prodId)
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
    .then(cart => {
      // Sequelize will look into the CartItem inBetween table to see associated products
      // returns an array of products with additionnal cartItem object (holds quantity)
      return cart
        .getProducts()
        .then(products => {
          console.log('products', products);
          res.render('shop/cart', {
            docTitle: 'My cart',
            path: '/cart',
            products: products,
          });
        })
        .catch(err => console.log(err, err));
    })
    .catch(err => console.log('err', err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;

  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({where: {id: prodId}})
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      // if product in card, increment qty
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      // else add the product
      return Product.findByPk(prodId)
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity }
      });
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log('err', err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts({ where: {id: prodId}});
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(result => {
      console.log('PRODUCT REMOVED FROM CART');
      res.redirect('/cart');
    })
    .catch(err => console.log('err', err));
};

exports.getOrders = (req, res) => {
  req.user
    // include a product array for each order
    // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11739070#overview
    .getOrders({include: ['products']})
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

  req.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return req.user
        .createOrder()
        .then(order => {
          return order.addProducts(products.map(product => {
            // For each product we add a cartItem object with a quantity
            // (to correctly fills cartItem table entry)
            product.orderItem = {
              quantity: product.cartItem.quantity,
            };
            return product;
          }));
        })
        .then(result => {
          return fetchedCart.setProducts(null);
        })
        .then(result => {
          console.log('CREATED ORDER AND REMOVED CART ITEMS');
          res.redirect('/orders');
        })
        .catch(err => console.log('err', err));

    })
    .catch(err => console.log('err', err));
};
