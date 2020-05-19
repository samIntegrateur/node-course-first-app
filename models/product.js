const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectID,
    required: true,
    ref: 'User', // ref to User model
  },
});

// Will create a products collection
module.exports = mongoose.model('Product', productSchema);

// const mongoDb = require('mongodb');
// const getDb = require('../util/database').getDb;
//
//
// const getObjectId = (id) => {
//   return new mongoDb.ObjectId(id);
// }
//
// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? getObjectId(id) : null;
//     this.userId = userId;
//   }
//
//   save() {
//     const db = getDb();
//     let dbAction;
//
//     if (this._id) {
//       // update
//       dbAction = db.collection('products')
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       // create
//       dbAction = db.collection('products').insertOne(this);
//     }
//
//     return dbAction
//       .then(result => {
//         console.log('result', result);
//       })
//       .catch(err => console.log('err', err));
//   }
//
//   // find will only return a cursor, we have to use a method like toArray or next
//   // to actually get data
//   static fetchAll() {
//     const db = getDb();
//     return db.collection('products')
//       .find()
//       .toArray()
//       .then(products => {
//         console.log('products', products);
//         return products;
//       })
//       .catch(err => console.log('err', err));
//   }
//
//   static findById(productId) {
//     const db = getDb();
//     return db.collection('products')
//       // Ids are not just string in mongodb
//       .find({ _id: getObjectId(productId) })
//       .next()
//       .then(product => {
//         console.log('product', product);
//         return product;
//       })
//       .catch(err => console.log('err', err));
//   }
//
//   static deleteById(productId) {
//     const db = getDb();
//     return db.collection('products')
//       .deleteOne({_id: getObjectId(productId)})
//       .then(result => {
//         console.log('DELETED');
//       })
//       .catch(err => console.log('err', err));
//   }
// }
//
// module.exports = Product;
