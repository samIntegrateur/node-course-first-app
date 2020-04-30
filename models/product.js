const fs = require('fs');
const path = require('path');
const Cart = require('./cart');

const productsFilePath = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const getProductsFromFile = (cb) => {
  fs.readFile(productsFilePath, (err, fileContent) => {
    if (err) {
      console.error('error', err);
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
}

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile(products => {
      let updatedProducts = [...products];

      // update case
      if (this.id) {
        const existingProductIndex = products.findIndex(p => p.id === this.id);
        updatedProducts[existingProductIndex] = this;
      } else {
        // add case
        this.id = Math.random().toString();
        updatedProducts.push(this);
      }
      fs.writeFile(productsFilePath, JSON.stringify(updatedProducts), (err) => {
        console.error('error', err);
      });
    });
  }

  // readFile is async, we use a callback function arg
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(prod => prod.id === id);
      cb(product);
    });
  }

  static deleteById(id) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id);
      const productPrice = +product.price;
      console.log('productPrice', productPrice);
      const updatedProduct = products.filter(prod => prod.id !== id);
      fs.writeFile(productsFilePath, JSON.stringify(updatedProduct), err => {
        if (err) {
          console.error('error', err);
        } else {
          Cart.deleteProduct(id, productPrice);
        }
      });
    });
  }
}
