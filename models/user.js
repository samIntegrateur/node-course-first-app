const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  // name: {
  //   type: String,
  //   required: true,
  // },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    items: [{
      productId: {
        type: Schema.Types.ObjectID,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      }
    }],
  },
});

// Add our custom method
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11954176#overview
userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    // update
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      // create
      updatedCartItems.push({
        productId: product._id,
        quantity: newQuantity,
      });
    }

    const updatedCart = {
      items: updatedCartItems
    };

    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(cartItem => {
    return cartItem.productId.toString() !== productId.toString();
  });

  this.cart.items = updatedCartItems;
  return this.save();
}

userSchema.methods.clearCart = function(productId) {
  this.cart = { items: [] };
  return this.save();
}

module.exports = mongoose.model('User', userSchema);

// const mongoDb = require('mongodb');
// const getDb = require('../util/database').getDb;
//
// const getObjectId = (id) => {
//   return new mongoDb.ObjectId(id);
// }
//
// class User {
//   // cart is a property of user, whereas order has it's own collection
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }
//
//   save() {
//     const db = getDb();
//     return db.collection('users').insertOne(this);
//   }
//
//   addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex(cp => {
//       return cp.productId.toString() === product._id.toString();
//     });
//
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];
//
//     // update
//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       // create
//       updatedCartItems.push({
//         productId: product._id,
//         quantity: newQuantity,
//       });
//     }
//
//     const updatedCart = {
//       items: updatedCartItems
//     };
//     const db = getDb();
//
//     return db.collection('users').updateOne(
//       { _id: getObjectId(this._id) },
//       { $set: {cart: updatedCart} }
//     );
//   }
//
//   getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map(item => item.productId);
//
//     // get full products for stored ids
//     return db.collection('products')
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then(products => {
//         return products.map(p => {
//           // add quantity information
//           return {
//             ...p,
//             quantity: this.cart.items.find(i => {
//               return i.productId.toString() === p._id.toString();
//             }).quantity
//           }
//         });
//       });
//   }
//
//   removeFromCart(productId) {
//     const updatedCartItems = this.cart.items.filter(cartItem => {
//       return cartItem.productId.toString() !== productId.toString();
//     });
//
//     const updatedCart = {
//       items: updatedCartItems
//     };
//
//     const db = getDb();
//
//     return db.collection('users').updateOne(
//       { _id: getObjectId(this._id) },
//       { $set: {cart: updatedCart} }
//     );
//   }
//
//   addOrder() {
//     const db = getDb();
//
//     // push current cart to order table, enhanced with more products informations and user infos
//     return this.getCart()
//       .then(products => {
//         const order = {
//           items: products,
//           user: {
//             _id: getObjectId(this._id),
//             name: this.name,
//           }
//         };
//         return db.collection('orders').insertOne(order);
//       })
//       // then remove cart
//       .then(result => {
//         this.cart = {items: []};
//         return db.collection('users').updateOne(
//           { _id: getObjectId(this._id) },
//           { $set: {cart: {items: []}} }
//         );
//       });
//   }
//
//   getOrders() {
//     const db = getDb();
//     return db.collection('orders')
//       .find({'user._id': getObjectId(this._id)})
//       .toArray();
//   }
//
//   static findById(userId) {
//     const db = getDb();
//     return db.collection('users')
//       .findOne({_id: getObjectId(userId)}) // alt to find().next()
//   }
//
// }
// module.exports = User;
