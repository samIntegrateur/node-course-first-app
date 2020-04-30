const fs = require('fs');
const path = require('path');

const cartFilePath = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'cart.json',
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // Fetch previous cart
    fs.readFile(cartFilePath, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }

      // Analyse = find existing product
      const existingProductIndex = cart.products.findIndex(p => p.id === id);
      const existingProduct = cart.products[existingProductIndex];
      let updatedCardProducts;

      // Add new product / increase quantity
      if (existingProduct) {
        const updatedProduct = {
          ...existingProduct,
          quantity: existingProduct.quantity + 1,
        }
        updatedCardProducts = [...cart.products];
        updatedCardProducts[existingProductIndex] = updatedProduct;
      } else {
        const newProduct = {
          id: id, quantity: 1,
        }
        updatedCardProducts = [...cart.products, newProduct];
      }

      cart.totalPrice = cart.totalPrice + +productPrice;

      const updatedTotalPrice = cart.totalPrice + +productPrice;
      const updatedCart = {
        products: updatedCardProducts,
        totalPrice: updatedTotalPrice,
      };

      fs.writeFile(cartFilePath, JSON.stringify(updatedCart), err => {
        if (err) {
          console.error(err);
        }
      })
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(cartFilePath, (err, fileContent) => {
      if (err) {
        return;
      }
      const cart = JSON.parse(fileContent);
      const updatedCart = {...cart};
      const product = updatedCart.products.find(p => p.id === id);
      if (!product) {
        return;
      }
      const productQuantity = product.quantity;

      // remove product
      updatedCart.products = updatedCart.products.filter(p => p.id !== id);

      // update totalPrice
      console.log('productPrice', productPrice);
      console.log('productQuantity', productQuantity);
      updatedCart.totalPrice = updatedCart.totalPrice - (productPrice * productQuantity);
      fs.writeFile(cartFilePath, JSON.stringify(updatedCart), err => {
        if (err) {
          console.error(err);
        }
      })
    });
  }

  static getCart(cb) {
    fs.readFile(cartFilePath, (err, fileContent) => {
      if (err) {
        console.error(err);
        cb(null);
      } else {
        const cart = JSON.parse(fileContent);
        cb(cart);
      }
    });
  }
}
