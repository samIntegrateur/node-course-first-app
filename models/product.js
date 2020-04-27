const fs = require('fs');
const path = require('path');

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
  constructor(t) {
    this.title = t;
  }

  save() {
    getProductsFromFile(products => {
      products.push(this);
      fs.writeFile(productsFilePath, JSON.stringify(products), (err) => {
        console.error('error', err);
      });
    });
  }

  // readFile is async, we use a callback function arg
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

}
