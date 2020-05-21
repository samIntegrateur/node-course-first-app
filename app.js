const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const MongoDbUri = require('./db-config');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const app = express();
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));

// configure cnx between session and mongodb
const store = new MongoDBStore({
  uri: MongoDbUri,
  collection: 'sessions',
});

const csrfProtection = csrf({});

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
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');


const User = require('./models/user');

// can parse content from form
app.use(bodyParser.urlencoded({extended: false}));


// Read access to public dir
app.use(express.static(path.join(__dirname, 'public')));

// Configure session
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store, // store it in mongodb
}));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  // avoid adding this on each view
  res.locals = {
    isAuthenticated: req.user,

    // for each post request, csurf will look for a _name field containing the token value to allow post
    // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11954372#overview
    csrfToken: req.csrfToken(),
  }
  next();
});

// Bind the user mongoose object to req
// What we do in auth postLogin is just storing data,
// we need a mongoose object to access methods like "addToCart"
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11954320#overview
app.use((req, res, next) => {

  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      // throw new Error('toto');
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render();

  // redirect would trigger an infinite loop if error in a middleware with no condition
  // like the one above binding the user
  // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/12025806#overview
  // res.redirect('/500');
  res.status(500).render('500', {
    docTitle: "Page not found",
    path: '/500',
  })
});

mongoose.connect(MongoDbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    // Create dumb user if there isn't
    // User.findOne().then(user => {
    //   if (!user) {
    //     const user = new User({
    //       name: 'Sam',
    //       email: 'sam@test.com',
    //       cart: {
    //         items: [],
    //       },
    //     });
    //     user.save();
    //   }
    // });

    app.listen(3000);
  })
  .catch(err => console.log('err', err));
