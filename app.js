const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// console.log('process.env.NODE_ENV', process.env.NODE_ENV);

const app = express();
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@nodecourse-72dr8.mongodb.net/${process.env.MONGO_DEFAULT_DB}`;

// configure cnx between session and mongodb
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

const csrfProtection = csrf({});

// start server only if we find the ssl files
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/12198032#overview
// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

// diskStorage is a storage engine that we use with multer
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = path.parse(file.originalname).name;
    const fileExt = path.parse(file.originalname).ext;
    cb(null, fileName + '-' + uniqueSuffix + fileExt);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

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

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a' // a for append (don't overwrite)
});

// add some headers for security
app.use(helmet());
// compress resources
app.use(compression());
// log
app.use(morgan('combined', { stream: accessLogStream }));

const errorController = require('./controllers/error');


const User = require('./models/user');

// can parse content from form
app.use(bodyParser.urlencoded({extended: false}));
// handle image form data
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));


// Read access to public dir
app.use(express.static(path.join(__dirname, 'public')));
// like this, we keep the images folder as a path
app.use('/images', express.static(path.join(__dirname, 'images')));

// Configure session
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store, // store it in mongodb
}));

app.use(csrfProtection);
app.use(flash());

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



app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {

  console.error(error);
  // res.status(error.httpStatusCode).render();

  // redirect would trigger an infinite loop if error in a middleware with no condition
  // like the one above binding the user
  // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/12025806#overview
  // res.redirect('/500');
  res.status(500).render('500', {
    docTitle: "Page not found",
    path: '/500',
    isAuthenticated: req.user,
  })
});

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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

    // This is how we would run an https server
    // In the end we won't use it because host providers have their own mechanism
    // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/12198032#overview
    // https.createServer({key: privateKey, cert: certificate}, app).listen(process.env.PORT || 3000);
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => console.log('err', err));
