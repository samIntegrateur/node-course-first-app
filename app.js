const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const dbConfig = require('./db-config');
const mongoose = require('mongoose');

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


const User = require('./models/user');

// can parse content from form
app.use(bodyParser.urlencoded({extended: false}));


// Read access to public dir
app.use(express.static(path.join(__dirname, 'public')));

// Bind the user mongoose object to req
app.use((req, res, next) => {
  User.findById('5eb430941d41ca46b4d04ac8')
    .then(user => {
      if (user) {
        req.user = user;
      } else {
        console.warn('user not found');
      }
      next();
    })
    .catch(err => console.log('err', err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect(dbConfig, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    // Create dumb user if there isn't
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Sam',
          email: 'sam@test.com',
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });

    app.listen(3000);
  })
  .catch(err => console.log('err', err));
