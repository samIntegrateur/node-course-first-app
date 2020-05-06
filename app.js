const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));

// Set a template engine
// https://expressjs.com/fr/api.html#app.set
// pug and ejs are built-in so we don't need the engine step
// app.engine('hbs', expressHandlebars({
//   layoutsDir: 'views/layouts/',
//   defaultLayout: 'main-layout',
//   extname: 'hbs', // only for defaultLayout (shame)
// }));
app.set('view engine', 'ejs');
// where to find templates
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');

// can parse content from form
app.use(bodyParser.urlencoded({extended: false}));

// Read access to public dir
app.use(express.static(path.join(__dirname, 'public')));

// Add middleware
// app.use( (req, res, next) => {
//   next(); // Allows the request to continue to the next middleware
// });

// add a new "user" sequelize object to req
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11739032#overview
app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log('err', err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// const server = http.createServer(app);

// Event loop pattern
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11561888#overview
// server.listen(3000);

// relationship
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11739030#overview

// in a sense user creator of products (not buyer)
// delete Cascade: if a user is deleted, his products are deleted too
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
// from that, sequelize, will create a foreign userId key in the product table

User.hasOne(Cart);
Cart.belongsTo(User); // optionnal, we don't have to specify 2 directions

// Many to many relationship
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11739044#overview
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, { through: OrderItem })


// Create tables if they don't exist
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11739006#overview
sequelize
  // .sync({force: true}) // force re-create table
  .sync()
  .then(result => {
    return User.findByPk(1);

    app.listen(3000);
  })
  .then(user => {
    // create dummy user on the fly
    if (!user) {
      return User.create({ name: 'sam', email: 'sam@test.fr'});
    }
    return user;
  })
  .then(user => {
    return user.getCart()
      .then(cart => {
        if (!cart) {
          return user.createCart();
        }
        return cart;
      })
      .catch(err => {
        console.log('err', err)
      });
  })
  .then(cart => {
    app.listen(3000);
  })
  .catch(err => {
    console.log('err', err)
  });

