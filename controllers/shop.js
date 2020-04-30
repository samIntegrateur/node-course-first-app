const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getIndex = (req, res) => {
  Product.fetchAll((products) => {
    res.render('shop/index', {
      products: products,
      docTitle: 'My awesome patisserie',
      path: '/',
    });
  });
}

exports.getProducts = (req, res) => {
  Product.fetchAll((products) => {
    res.render('shop/product-list', {
      products: products,
      docTitle: 'Products ',
      path: '/products',
    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  console.log('prodId', prodId);
  Product.findById(prodId, product => {
    console.log('product', product);
    res.render('shop/product-detail', {
      docTitle: product.title,
      path: '/products',
      product: product,
    });
  })
};

exports.getCart = (req, res) => {
  // get cart
  Cart.getCart(cart => {
    // get products and filter the ones in the card
    Product.fetchAll(products => {
      const cardProducts = [];

      if (cart) {
        for (const product of products) {
          const cardProductData = cart.products.find(prod => prod.id === product.id);
          if (cardProductData) {
            cardProducts.push({productData: product, quantity: cardProductData.quantity });
          }
        }
      }

      res.render('shop/cart', {
        docTitle: 'My cart',
        path: '/cart',
        products: cardProducts,
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  console.log('prodId', prodId);
  Product.findById(prodId, product => {
    Cart.addProduct(prodId, product.price);
  })
  res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect('/cart');
  });
};

exports.getOrders = (req, res) => {
  res.render('shop/orders', {
    docTitle: 'My orders',
    path: '/orders',
  });
};

exports.getCheckout = (req, res) => {
  res.render('shop/checkout', {
    docTitle: 'Checkout',
    path: '/checkout',
  });
};


