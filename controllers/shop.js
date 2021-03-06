const fs = require('fs');
const path = require('path');

const pdfKitDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const ITEMS_PER_PAGE = 4;

exports.getIndex = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(productsNumber => {
      totalItems = productsNumber;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/index', {
        products: products,
        docTitle: 'Drômadélice',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

exports.getProducts = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(productsNumber => {
      totalItems = productsNumber;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/product-list', {
        products: products,
        docTitle: 'Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;

  req.user
    .populate('cart.items.productId') // get the full product ref (productId will be the object instead of id)
    .execPopulate()
    .then(user => {
      products = user.cart.items;
      total = 0;

      if (!products.length) {
        return res.render('shop/checkout', {
          docTitle: 'Checkout',
          path: '/checkout',
          products: products,
          totalSum: total.toFixed(2),
          sessionId: null,
        });
      }

      products.forEach(product => {
        total += product.quantity * product.productId.price;
      })

      // map our card to the format stripe awaits
      // nb: the checkout/success (that add an order and clean card) is not secure as we can manually enter the url
      // see stripe doc to implement a secure way
      // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/12034728#overview
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(product => {
          return {
            name: product.productId.title,
            description: product.productId.description,
            amount: Math.round(product.productId.price.toFixed(2) * 100), // in cents (error if not integer)
            currency: 'usd',
            quantity: product.quantity,
          };
        }),
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
      })
        .then(session => {
          res.render('shop/checkout', {
            docTitle: 'Checkout',
            path: '/checkout',
            products: products,
            totalSum: total.toFixed(2),
            sessionId: session.id,
          });
        })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// pasted from postOrder
exports.getCheckoutSuccess = (req, res, next) => {
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

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  // Check if the asker is the right user
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }

      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);


      // CREATE PDF
      const pdfDoc = new pdfKitDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      // pipe our readable stream into the response
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text(`Invoice N°\ ${orderId}`, { underline: true });
      pdfDoc.text('---------------------');

      let totalPrice = 0;
      order.products.forEach(product => {
        totalPrice += product.quantity * product.product.price;
        pdfDoc.fontSize(18).text(`${product.product.title} - ${product.quantity} x $${product.product.price}`);
      });

      pdfDoc.text('---------------------');

      pdfDoc.fontSize(22).text('Total price : $' + totalPrice.toFixed(2), {bold: true});

      pdfDoc.end();

      // GET PDF
      // Preload data, can be slow for heavy files
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   // inline to open it in the browser, attachment to download
      //   // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/12025868#overview
      //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
      //   res.send(data);
      // });

      // streaming data
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
      // pipe our readable stream into the response
      // file.pipe(res);
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

};
